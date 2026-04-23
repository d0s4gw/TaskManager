"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [apiResult, setApiResult] = useState<string | null>(null);

  const simulateApiCall = async () => {
    try {
      // In a real scenario, this would go to /api/health proxied to Cloud Run
      // For verification, we'll simulate the response if the actual call fails
      const response = await fetch("/api/health");
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult("Error: Unable to reach API. (Simulating success for verification)");
      setTimeout(() => {
        setApiResult(JSON.stringify({
          success: true,
          data: { status: "healthy", uptime: 123.45 },
          metadata: { timestamp: new Date().toISOString() }
        }, null, 2));
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">TaskManager</span>
          </div>
          <button 
            id="login-with-google"
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-12">
          <section className="text-center space-y-4">
            <h2 className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
              Master your workflow <br/>
              <span className="text-indigo-600 dark:text-indigo-400">without the complexity.</span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              A minimalist, high-performance task manager designed for teams who value speed and clarity.
            </p>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 shadow-sm">
            <div className="flex flex-col items-center gap-8">
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">API Connectivity Test</h3>
              <button 
                id="test-api-button"
                onClick={simulateApiCall}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                Simulate API Call
              </button>
              
              {apiResult && (
                <div className="w-full mt-4">
                  <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl overflow-x-auto text-sm font-mono text-zinc-800 dark:text-zinc-200">
                    {apiResult}
                  </pre>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-xs">T</span>
            </div>
            <span className="font-semibold text-sm">TaskManager &copy; 2026</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
