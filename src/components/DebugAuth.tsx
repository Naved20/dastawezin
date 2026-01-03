import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DebugAuth = () => {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Check connection
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check if tables exist
        const { data: tables, error: tablesError } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true });

        // Check if auth is working
        const { data: authConfig } = await supabase
          .from('auth.users')
          .select('count', { count: 'exact', head: true });

        setDebug({
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
          currentSession: session ? 'Active' : 'None',
          profilesTableExists: !tablesError,
          profilesTableError: tablesError?.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        setDebug({
          error: err.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    };

    checkSetup();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="overflow-auto max-h-48">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
};
