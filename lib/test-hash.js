const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2b$10$tU72Hayqu4sM7vr0HTUNx.PGGKKoaTZUA/.sD.P8Sh5tYhKApN7h.y';

const result = bcrypt.compareSync(password, hash);
console.log('Comparison test result:', result);
console.log('Password length:', password.length);
console.log('Hash length:', hash.length);
