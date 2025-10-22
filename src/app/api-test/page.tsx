'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [userApiResult, setUserApiResult] = useState<any>(null);
  const [dashboardsApiResult, setDashboardsApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get user_id from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  const testUserApi = async () => {
    if (!userId) {
      setUserApiResult({ error: 'No user_id in localStorage. Please login first.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUserApiResult({ status: response.status, data });
    } catch (error: any) {
      setUserApiResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDashboardsApi = async () => {
    if (!userId) {
      setDashboardsApiResult({ error: 'No user_id in localStorage. Please login first.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/dashboards`);
      const data = await response.json();
      setDashboardsApiResult({ status: response.status, data });
    } catch (error: any) {
      setDashboardsApiResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Routes Test Page 🧪</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Test your Next.js API routes to verify they're proxying correctly to FastAPI backend.
        Open <strong>Firefox Developer Tools (F12) → Network tab</strong> to see the requests.
      </p>

      {userId ? (
        <div style={{ 
          background: '#e8f5e9', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #4caf50'
        }}>
          ✅ Logged in as user ID: <strong>{userId}</strong>
        </div>
      ) : (
        <div style={{ 
          background: '#fff3e0', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #ff9800'
        }}>
          ⚠️ Not logged in. Please <a href="/login">login first</a> to test authenticated API routes.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* User API Test */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2>Test User API</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            GET /api/users/{userId}
          </p>
          <button 
            onClick={testUserApi}
            disabled={loading || !userId}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: userId ? 'pointer' : 'not-allowed',
              opacity: userId ? 1 : 0.5,
              marginTop: '10px'
            }}
          >
            {loading ? 'Testing...' : 'Test User API'}
          </button>

          {userApiResult && (
            <div style={{ 
              marginTop: '20px', 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <strong>Result:</strong>
              <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(userApiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Dashboards API Test */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2>Test Dashboards API</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            GET /api/users/{userId}/dashboards
          </p>
          <button 
            onClick={testDashboardsApi}
            disabled={loading || !userId}
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: userId ? 'pointer' : 'not-allowed',
              opacity: userId ? 1 : 0.5,
              marginTop: '10px'
            }}
          >
            {loading ? 'Testing...' : 'Test Dashboards API'}
          </button>

          {dashboardsApiResult && (
            <div style={{ 
              marginTop: '20px', 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <strong>Result:</strong>
              <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(dashboardsApiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #2196f3'
      }}>
        <h3>🔍 How to verify in Firefox Developer Tools:</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Press <strong>F12</strong> to open Developer Tools</li>
          <li>Go to the <strong>Network</strong> tab</li>
          <li>Click one of the test buttons above</li>
          <li>Look for requests starting with <code>/api/users/</code></li>
          <li>Click on the request to see:
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li><strong>Headers</strong> - Request/response headers</li>
              <li><strong>Response</strong> - JSON data returned</li>
              <li><strong>Timings</strong> - How long it took</li>
            </ul>
          </li>
        </ol>

        <h4 style={{ marginTop: '20px' }}>What you should see:</h4>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>✅ Request to <code>/api/users/YOUR_ID</code> (Next.js API route)</li>
          <li>✅ Status: <strong>200 OK</strong> (if successful)</li>
          <li>✅ Response contains user data from FastAPI backend</li>
          <li>✅ The backend URL (<code>http://user_service:5000</code>) is <strong>hidden</strong> - client only sees <code>/api/users/...</code></li>
        </ul>

        <h4 style={{ marginTop: '20px' }}>🎯 This proves SSR infrastructure works!</h4>
        <p style={{ marginTop: '10px', color: '#555' }}>
          The browser calls <code>/api/users/*</code>, which is handled by your Next.js server.
          The Next.js server then calls FastAPI internally (server-to-server).
          This is the foundation for Server-Side Rendering - the same routes will work in Server Components!
        </p>
      </div>
    </div>
  );
}
