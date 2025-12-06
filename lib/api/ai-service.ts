import { loadConfiguration } from '../config/loader';
import { applyAuthentication } from './auth-handler';
import { createUserFriendlyError, ErrorCode } from '../utils/errors';
import type { AIServiceConfig } from '../types/ai-service';

interface AIRequest {
  prompt: string;
  context?: unknown;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  result: string;
  tokensUsed?: number;
}

/**
 * Process a request using an AI service
 */
export async function processAIRequest(
  serviceId: string,
  request: AIRequest
): Promise<AIResponse> {
  const config = loadConfiguration();
  const service = config.aiServices.find((s) => s.id === serviceId);

  if (!service) {
    throw {
      message: `AI service '${serviceId}' not found`,
      code: ErrorCode.VALIDATION_ERROR,
      retryable: false,
    };
  }

  // For demo service, return a mock response
  if (service.provider === 'demo') {
    return {
      result: `[Demo AI Response] Processed: "${request.prompt.substring(0, 50)}..."`,
      tokensUsed: Math.floor(request.prompt.length / 4),
    };
  }

  // Build request URL
  const url = `${service.endpointUrl}/process`;

  // Prepare headers
  const headers = applyAuthentication(service.authentication, {
    'Content-Type': 'application/json',
  });

  // Prepare request body
  const body = {
    prompt: request.prompt,
    context: request.context,
    model: service.model,
    temperature: request.temperature ?? service.temperature,
    max_tokens: request.maxTokens ?? service.maxTokens,
  };

  // Prepare request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), service.timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `AI service returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      result: data.result || data.text || String(data),
      tokensUsed: data.tokensUsed || data.usage?.total_tokens,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const friendlyError = createUserFriendlyError(
      error,
      `Failed to process AI request with ${service.provider}`
    );
    friendlyError.code = ErrorCode.EXTERNAL_SERVICE_ERROR;
    friendlyError.retryable = true;
    throw friendlyError;
  }
}

/**
 * Get AI service by ID
 */
export function getAIService(serviceId: string): AIServiceConfig | undefined {
  const config = loadConfiguration();
  return config.aiServices.find((s) => s.id === serviceId);
}

