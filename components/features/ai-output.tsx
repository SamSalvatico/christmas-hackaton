'use client';

interface AIOutputProps {
  result: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

export function AIOutput({ result, metadata }: AIOutputProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">AI Result</h3>
      <div className="mb-4">
        <p className="whitespace-pre-wrap">{result}</p>
      </div>
      {metadata && (
        <div className="text-sm text-gray-500 space-y-1">
          {metadata.model && <p>Model: {metadata.model}</p>}
          {metadata.tokensUsed && <p>Tokens used: {metadata.tokensUsed}</p>}
          {metadata.processingTime && (
            <p>Processing time: {metadata.processingTime}ms</p>
          )}
        </div>
      )}
    </div>
  );
}

