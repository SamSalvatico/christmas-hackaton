'use client';

interface ExternalDataDisplayProps {
  data: unknown;
  sourceId: string;
  isLoading?: boolean;
}

export function ExternalDataDisplay({
  data,
  sourceId,
  isLoading = false,
}: ExternalDataDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-gray-500">Loading data from {sourceId}...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Data from {sourceId}</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

