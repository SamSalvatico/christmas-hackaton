import Link from 'next/link';

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

        <div className="grid gap-4 md:grid-cols-2 mb-8">
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

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/external-data"
              className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              View External Data
            </Link>
            <Link
              href="/ai"
              className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              AI Processing
            </Link>
            <Link
              href="/api/health"
              className="block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
            >
              Health Check
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

