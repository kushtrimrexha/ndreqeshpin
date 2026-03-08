import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mvbojcfilzflnkgtlyex.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Ym9qY2ZpbHpmbG5rZ3RseWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTc5ODIsImV4cCI6MjA4ODE3Mzk4Mn0.8unZs1SQcSnS3HFI2ZukUBCTe2ap7ZAw3DHqp8M-g1w';

export const supabaseAdmin = createClient(url, key);