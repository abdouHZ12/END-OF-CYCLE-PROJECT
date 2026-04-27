type JwtExpires = `${number}${"s" | "m" | "h" | "d"}`;

function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpires: (process.env.JWT_ACCESS_EXPIRES || '15m') as JwtExpires,
    refreshExpires: (process.env.JWT_REFRESH_EXPIRES || '7d') as JwtExpires,
  },

  smtp: {
    host: requireEnv('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT) || 587,
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS'),
    from: requireEnv('SMTP_FROM'),
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

} as const;
