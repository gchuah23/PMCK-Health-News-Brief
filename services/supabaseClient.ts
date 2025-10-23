import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

/**
 * Initializes the Supabase client with user-provided credentials.
 * This function should only be called once when the application starts
 * after retrieving the credentials.
 * @param url - The Supabase project URL.
 * @param key - The Supabase project anon key.
 * @returns The initialized Supabase client instance.
 */
export const initializeSupabaseClient = (url: string, key: string): SupabaseClient => {
  if (!supabase) {
    supabase = createClient(url, key);
  }
  return supabase;
};

/**
 * Retrieves the singleton Supabase client instance.
 * Throws an error if the client has not been initialized yet.
 * @returns The Supabase client instance.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error("Supabase client has not been initialized. Call initializeSupabaseClient first.");
  }
  return supabase;
};

/**
 * Tests the connection to Supabase and verifies that the 'articles' table exists.
 * @param url - The Supabase project URL.
 * @param key - The Supabase project anon key.
 * @returns A promise that resolves if the connection is successful and the table exists.
 * @throws An error with a descriptive message if the connection or table check fails.
 */
export const testSupabaseConnection = async (url: string, key: string): Promise<void> => {
  try {
    const testClient = createClient(url, key);
    // Use { head: true } to check for table existence without fetching data.
    // This is efficient and only requires SELECT permissions.
    const { error } = await testClient.from('articles').select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('Could not find the table')) {
        throw new Error("Connection successful, but the 'articles' table was not found. Please run the provided SQL setup script in your Supabase project's SQL Editor.");
      } else if (error.message.includes('Invalid API key') || error.message.includes('invalid JWT')) {
        throw new Error("Connection failed: Invalid API Key. Please double-check your Supabase Anon Key.");
      } else if (error.message.includes('rls')) {
         throw new Error("Connection successful, but access was denied. Please check your Row Level Security (RLS) policies for the 'articles' table to ensure public read access is enabled.");
      }
      // Generic error for other issues
      throw new Error(`Supabase connection error: ${error.message}`);
    }
  } catch (e) {
    if (e instanceof Error) {
        // Re-throw the detailed error from the logic above or a generic network error
        throw e;
    }
    throw new Error("A network or unknown error occurred while trying to connect to Supabase. Check the browser console and your network connection.");
  }
};