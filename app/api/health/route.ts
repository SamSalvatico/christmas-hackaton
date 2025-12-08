import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/utils/response';

export async function GET() {
  try {
    
    const healthData = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      version: '0.1.0',
    };

    const response = createSuccessResponse(healthData);
    return NextResponse.json(response);
  } catch {
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

