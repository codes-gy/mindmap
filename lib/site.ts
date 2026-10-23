/** 사이트 주소: NEXT_PUBLIC_SITE_URL이 없으면 Vercel 운영 주소, 그것도 없으면 로컬 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
