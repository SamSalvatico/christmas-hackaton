import { NextResponse } from 'next/server';
import { loadConfiguration } from '@/lib/config/loader';
import { createSuccessResponse } from '@/lib/utils/response';

export async function GET() {
  try {
    const config = loadConfiguration();

    const healthData = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      version: '0.1.0',
      services: {
        externalData: {
          available: config.externalDataSources.length,
          total: config.externalDataSources.length,
        },
        ai: {
          available: config.aiServices.length,
          total: config.aiServices.length,
        },
      },
    };

    const response = createSuccessResponse(healthData);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Health check failed',
          code: 'SERVICE_UNAVAILABLE',
          retryable: false,
        },
        metadata: {
          timestamp: Date.now(),
        },
      },
      { status: 503 }
    );
  }
}

