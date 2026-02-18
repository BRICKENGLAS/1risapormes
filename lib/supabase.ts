import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://orqjuogfbmknefdspptz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycWp1b2dmYm1rbmVmZHNwcHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTc5ODAsImV4cCI6MjA4NjIzMzk4MH0.3YnDvea20TOyXcn_gXbto5r-7R5Zx614V9O9ijuSRrQ'
)
