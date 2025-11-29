export const env = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  tokenTtlHours: Number(process.env.JWT_TTL_HOURS || 24),
};
