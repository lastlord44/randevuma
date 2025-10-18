// scripts/prisma-deploy.js
const { execSync } = require("child_process");
const run = (c)=>execSync(c,{stdio:"inherit"});
const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL missing"); process.exit(1); }
run("npx prisma generate");
if (env === "production") run("npx prisma migrate deploy");
else run("npx prisma db push --accept-data-loss");