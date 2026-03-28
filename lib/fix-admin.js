const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://nakyslsytamvraplojcj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha3lzbHN5dGFtdnJhcGxvamNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYwODQ2NCwiZXhwIjoyMDkwMTg0NDY0fQ.S4QIoESTPfHynqkVQp52khjsJwq4WJOAlhmw-Lstk3A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassword() {
  const newPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  console.log('UPDATING admin@pos.com with new hash...');
  
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('email', 'admin@pos.com')
    .select();

  if (error) {
    console.error('ERROR UPDATING PASSWORD:', error);
  } else {
    console.log('SUCCESS! Updated user:', data[0].email);
    console.log('NEW HASH:', hashedPassword);
    console.log('HASH LENGTH:', hashedPassword.length);
  }
}

fixPassword();
