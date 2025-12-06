import { NextRequest, NextResponse } from 'next/server';
import { processAIRequest, getAIService } from '@/lib/api/ai-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { createUserFriendlyError, ErrorCode } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { serviceId, prompt, context, options } = body;

    // Validation
    if (!serviceId) {
      return NextResponse.json(
        createErrorResponse({
          message: 'serviceId is required',
          code: ErrorCode.VALIDATION_ERROR,
          retryable: false,
        }),
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        createErrorResponse({
          message: 'prompt is required and must be a non-empty string',
          code: ErrorCode.VALIDATION_ERROR,
          retryable: false,
        }),
        { status: 400 }
      );
    }

    // Check if service exists
    const service = getAIService(serviceId);
    if (!service) {
      return NextResponse.json(
        createErrorResponse({
          message: `AI service '${serviceId}' not found`,
          code: ErrorCode.VALIDATION_ERROR,
          retryable: false,
        }),
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(serviceId, service.rateLimit);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        createErrorResponse({
          message: 'Rate limit exceeded. Please try again later.',
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          retryable: true,
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Reset': String(rateLimitCheck.resetTime || Date.now() + 60000),
          },
        }
      );
    }

    // Process AI request
    const aiRequest = {
      prompt,
      context,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    };

    const result = await processAIRequest(serviceId, aiRequest);
    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      createSuccessResponse(
        {
          result: result.result,
        },
        {
          serviceId,
          model: service.model,
          tokensUsed: result.tokensUsed,
          processingTime,
        }
      )
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const apiError =
      error && typeof error === 'object' && 'code' in error && 'retryable' in error
        ? (error as { message: string; code?: ErrorCode; retryable: boolean })
        : createUserFriendlyError(error, 'Failed to process AI request');

    return NextResponse.json(
      createErrorResponse(apiError, {
        processingTime,
      }),
      { status: 500 }
    );
  }
}

