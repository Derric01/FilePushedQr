'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [frontendUrl, setFrontendUrl] = useState<string>('');
  const [backendUrl, setBackendUrl] = useState<string>('');

  useEffect(() => {
    setFrontendUrl(window.location.origin);
    setBackendUrl(process.env.NEXT_PUBLIC_API_URL || 'Not configured');

    // Test API connection
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        setApiStatus(`✅ Connected! Backend is ${data.status}`);
      })
      .catch(error => {
        setApiStatus(`❌ Failed: ${error.message}`);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">🔧 Connection Test</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="font-semibold mb-2">Frontend URL:</h2>
              <code className="text-sm break-all">{frontendUrl}</code>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h2 className="font-semibold mb-2">Backend URL:</h2>
              <code className="text-sm break-all">{backendUrl}</code>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h2 className="font-semibold mb-2">API Status:</h2>
              <p className="text-lg">{apiStatus}</p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h2 className="font-semibold mb-2">📱 Instructions:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Make sure your phone is on the same WiFi network</li>
                <li>If you see "❌ Failed", check your firewall settings</li>
                <li>If you see "✅ Connected", go back to home page to upload files</li>
              </ol>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Home
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
