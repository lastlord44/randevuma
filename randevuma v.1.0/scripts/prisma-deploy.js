// scripts/prisma-deploy.js
const { execSync } = require("child_process");

function run(cmd) {
  console.log(`[prisma-deploy] ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const url = process.env.DATABASE_URL;

console.log(`[prisma-deploy] env=${env}`);
if (!url) {
  console.error("[prisma-deploy] DATABASE_URL missing. Failing build to avoid stale deploy.");
  process.exit(1);
}

try {
  run("npx prisma generate");
  if (env === "production") {
    run("npx prisma migrate deploy");
  } else {
    run("npx prisma db push --accept-data-loss");
  }
  console.log("[prisma-deploy] OK");
} catch (e) {
  console.error("[prisma-deploy] ERROR:", e?.message || e);
  process.exit(1);
}