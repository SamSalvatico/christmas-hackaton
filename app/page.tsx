export default function HomePage() {
  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Christmas Hackathon App
        </h1>
        <p className="text-lg text-center mb-8 text-gray-600">
          SSR Web Application with AI Integration
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-green-600">✅ Application is running</p>
            <p className="text-sm text-gray-500 mt-2">
              One-command setup successful!
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Next.js 16 SSR</li>
              <li>TypeScript Strict Mode</li>
              <li>External Data Integration</li>
              <li>AI-Powered Processing</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

