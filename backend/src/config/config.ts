import dotenv from 'dotenv';
dotenv.config();

type JwtExpires = `${number}${"s" | "m" | "h" | "d"}`;

export const config = {
  port: Number(process.env.PORT) || 3001,
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpires: (process.env.JWT_ACCESS_EXPIRES || '15m') as JwtExpires,
    refreshExpires: (process.env.JWT_REFRESH_EXPIRES || '7d') as JwtExpires,
  },

  host: process.env.SMTP_HOST as string,
  smtp: {
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    from: process.env.SMTP_FROM as string,
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

