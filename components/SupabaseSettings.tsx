import React, { useState } from 'react';
import { testSupabaseConnection } from '../services/supabaseClient';
import SqlSetupInstructions from './SqlSetupInstructions';

interface SupabaseSettingsProps {
  onSave: (url: string, key: string) => void;
}

const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({ onSave }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [formError, setFormError] = useState('');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testResult?.success) {
      onSave(url.trim(), key.trim());
    } else {
      setFormError('Please test the connection successfully before saving.');
    }
  };

  const handleTestConnection = async () => {
    setFormError('');
    setTestResult(null);
    if (!url.trim() || !key.trim()) {
      setFormError('Both URL and Key are required to test.');
      return;
    }
    setIsTesting(true);
    try {
      await testSupabaseConnection(url.trim(), key.trim());
      setTestResult({ success: true, message: 'Success! Connection established and articles table found.' });
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'An unknown error occurred.' });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleInputChange = () => {
    // Reset test results if user changes credentials
    if (testResult) {
        setTestResult(null);
    }
    if (formError) {
        setFormError('');
    }
  }

  const inputClasses = "w-full px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200";
  const baseButtonClasses = "w-full px-4 py-3 font-bold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out shadow-lg";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 space-y-6 bg-white rounded-xl shadow-2xl">
          <div>
            <h1 className="text-2xl font-bold text-center text-red-700">
              Supabase Configuration
            </h1>
            <p className="text-center text-sm text-slate-600 mt-2">
              Enter your Supabase credentials to get started.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="supabase-url" className="text-sm font-bold text-slate-700">
                Supabase Project URL
              </label>
              <input
                id="supabase-url"
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); handleInputChange(); }}
                placeholder="https://your-project-ref.supabase.co"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="supabase-key" className="text-sm font-bold text-slate-700">
                Supabase Anon (Public) Key
              </label>
              <input
                id="supabase-key"
                type="password"
                value={key}
                onChange={(e) => { setKey(e.target.value); handleInputChange(); }}
                placeholder="Enter your anon key"
                className={inputClasses}
                required
              />
            </div>
            
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            
            {testResult && (
              <div className={`p-3 text-sm rounded-md ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
               <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !url || !key}
                  className={`${baseButtonClasses} bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-400`}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  disabled={!testResult?.success}
                  className={`${baseButtonClasses} bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 focus:ring-orange-500 disabled:from-red-300 disabled:to-orange-200 disabled:cursor-not-allowed`}
                >
                  Save and Continue
                </button>
            </div>
            <div className="pt-4">
               <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300 ease-in-out shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Save this project to Github
                </a>
            </div>
          </form>
        </div>

        <SqlSetupInstructions />
      </div>
    </div>
  );
};

export default SupabaseSettings;