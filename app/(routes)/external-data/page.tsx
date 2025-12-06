'use client';

import { useState, useEffect } from 'react';
import { ExternalDataDisplay } from '@/components/features/external-data-display';
import { ExternalDataError } from '@/components/features/external-data-error';
import { AIInput } from '@/components/features/ai-input';
import { AIOutput } from '@/components/features/ai-output';
import { AIStatus } from '@/components/features/ai-status';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    code?: string;
    retryable: boolean;
  };
  metadata?: {
    sourceId: string;
    timestamp: number;
    responseTime: number;
  };
}

interface AIApiResponse {
  success: boolean;
  result?: string;
  error?: {
    message: string;
    code?: string;
    retryable: boolean;
  };
  metadata?: {
    serviceId: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  };
}

export default function ExternalDataPage() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryable, setRetryable] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiMetadata, setAiMetadata] = useState<AIApiResponse['metadata'] | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = JSON.stringify({ _limit: '5' });
      const response = await fetch(
        `/api/external-data?sourceId=sample-api&endpoint=posts&params=${encodeURIComponent(params)}`
      );
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else if (result.error) {
        setError(result.error.message);
        setRetryable(result.error.retryable || false);
      } else {
        setError('Unknown error occurred');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch external data'
      );
      setRetryable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISubmit = async (prompt: string) => {
    setAiStatus('processing');
    setAiError(null);
    setAiResult(null);
    setAiMetadata(null);

    try {
      // Include external data as context
      const context = data ? { externalData: data } : undefined;

      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: 'demo-ai',
          prompt,
          context,
        }),
      });

      const result: AIApiResponse = await response.json();

      if (result.success && result.result) {
        setAiResult(result.result);
        setAiMetadata(result.metadata || null);
        setAiStatus('idle');
      } else if (result.error) {
        setAiError(result.error.message);
        setAiStatus('error');
      } else {
        setAiError('Unknown error occurred');
        setAiStatus('error');
      }
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : 'Failed to process AI request'
      );
      setAiStatus('error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">External Data</h1>
        <p className="text-lg mb-8 text-gray-600">
          Displaying data from external sources
        </p>

        <div className="space-y-8">
          {error ? (
            <ExternalDataError
              message={error}
              retryable={retryable}
              onRetry={fetchData}
            />
          ) : (
            <ExternalDataDisplay
              data={data}
              sourceId="sample-api"
              isLoading={isLoading}
            />
          )}

          {data !== null && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Process with AI</h2>
              <p className="text-gray-600 mb-4">
                Use AI to process or analyze the external data above
              </p>
              <AIInput
                onSubmit={handleAISubmit}
                isLoading={aiStatus === 'processing'}
              />
              <div className="mt-4">
                <AIStatus
                  status={aiStatus}
                  message={
                    aiStatus === 'processing'
                      ? 'Processing your request...'
                      : aiError || undefined
                  }
                />
              </div>
              {aiResult && aiMetadata && (
                <div className="mt-4">
                  <AIOutput result={aiResult} metadata={aiMetadata} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

