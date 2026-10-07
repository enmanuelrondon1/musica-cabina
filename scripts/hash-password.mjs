// scripts/hash-password.mjs

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password || password.length < 8) {
  console.error("Uso: node scripts/hash-password.mjs 'tu-contraseña' (mínimo 8 caracteres)");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// Next.js interpreta "$" como variable en los archivos .env, así que se escapa con "\"
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll("$", () => "\\$")}`);