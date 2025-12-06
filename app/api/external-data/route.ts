import { NextRequest, NextResponse } from 'next/server';
import { fetchExternalData, getExternalDataSource } from '@/lib/api/external-data';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { createUserFriendlyError, ErrorCode } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const sourceId = searchParams.get('sourceId');
  const endpoint = searchParams.get('endpoint') || undefined;
  const paramsStr = searchParams.get('params');

  // Validation
  if (!sourceId) {
    return NextResponse.json(
      createErrorResponse({
        message: 'sourceId is required',
        code: ErrorCode.VALIDATION_ERROR,
        retryable: false,
      }),
      { status: 400 }
    );
  }

  // Check if source exists
  const source = getExternalDataSource(sourceId);
  if (!source) {
    return NextResponse.json(
      createErrorResponse({
        message: `External data source '${sourceId}' not found`,
        code: ErrorCode.VALIDATION_ERROR,
        retryable: false,
      }),
      { status: 400 }
    );
  }

  // Parse params if provided
  let params: Record<string, string> | undefined;
  if (paramsStr) {
    try {
      params = JSON.parse(paramsStr);
    } catch {
      return NextResponse.json(
        createErrorResponse({
          message: 'Invalid params format. Must be valid JSON',
          code: ErrorCode.VALIDATION_ERROR,
          retryable: false,
        }),
        { status: 400 }
      );
    }
  }

  try {
    const data = await fetchExternalData(sourceId, endpoint, params, 'GET');
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      createSuccessResponse(data, {
        sourceId,
        responseTime,
      })
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const apiError =
      error && typeof error === 'object' && 'code' in error && 'retryable' in error
        ? (error as { message: string; code?: ErrorCode; retryable: boolean })
        : createUserFriendlyError(error, 'Failed to fetch external data');

    return NextResponse.json(
      createErrorResponse(apiError, {
        sourceId,
        responseTime,
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const sourceId = searchParams.get('sourceId');
  const endpoint = searchParams.get('endpoint') || undefined;

  // Validation
  if (!sourceId) {
    return NextResponse.json(
      createErrorResponse({
        message: 'sourceId is required',
        code: ErrorCode.VALIDATION_ERROR,
        retryable: false,
      }),
      { status: 400 }
    );
  }

  // Check if source exists
  const source = getExternalDataSource(sourceId);
  if (!source) {
    return NextResponse.json(
      createErrorResponse({
        message: `External data source '${sourceId}' not found`,
        code: ErrorCode.VALIDATION_ERROR,
        retryable: false,
      }),
      { status: 400 }
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      createErrorResponse({
        message: 'Invalid request body. Must be valid JSON',
        code: ErrorCode.VALIDATION_ERROR,
        retryable: false,
      }),
      { status: 400 }
    );
  }

  try {
    const data = await fetchExternalData(sourceId, endpoint, undefined, 'POST', body);
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      createSuccessResponse(data, {
        sourceId,
        responseTime,
      })
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const apiError =
      error && typeof error === 'object' && 'code' in error && 'retryable' in error
        ? (error as { message: string; code?: ErrorCode; retryable: boolean })
        : createUserFriendlyError(error, 'Failed to send data to external source');

    return NextResponse.json(
      createErrorResponse(apiError, {
        sourceId,
        responseTime,
      }),
      { status: 500 }
    );
  }
}

