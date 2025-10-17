const { execSync } = require('child_process');

const isProduction = process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

console.log(`[prisma-deploy] Environment: ${process.env.VERCEL_ENV || 'development'}`);

try {
  if (isProduction) {
    console.log('[prisma-deploy] Running: prisma migrate deploy (production)');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } else if (isPreview) {
    console.log('[prisma-deploy] Running: prisma db push (preview)');
    execSync('npx prisma db push', { stdio: 'inherit' });
  } else {
    console.log('[prisma-deploy] Running: prisma generate (development)');
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
  
  console.log('[prisma-deploy] ✅ Prisma setup completed successfully');
} catch (error) {
  console.error('[prisma-deploy] ❌ Prisma setup failed:', error.message);
  process.exit(1);
}

