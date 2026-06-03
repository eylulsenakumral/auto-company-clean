/**
 * Supabase Client Configuration
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl ***REMOVED*** process.env.SUPABASE_URL;
const supabaseKey ***REMOVED*** process.env.SUPABASE_SERVICE_KEY;

export const supabase ***REMOVED*** createClient(supabaseUrl, supabaseKey);

/**
 * Real-time subscription helper
 */
export const subscribeToProspects ***REMOVED*** (callback) ***REMOVED***> {
  return supabase
    .channel('prospects_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'prospects' }, callback)
    .subscribe();
};

export const subscribeToCalls ***REMOVED*** (callback) ***REMOVED***> {
  return supabase
    .channel('calls_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, callback)
    .subscribe();
};
