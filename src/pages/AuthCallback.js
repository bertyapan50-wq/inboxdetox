import { useEffect } from 'react';

function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      console.log('✅ Token saved');
      // Redirect to root — GmailCleanupTool na ang mag-ha-handle
      window.location.href = '/';
    } else {
      console.log('❌ No token found');
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">Completing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback;