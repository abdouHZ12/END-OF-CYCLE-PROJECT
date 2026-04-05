## 1.Pull the main :
```
git pull origin main
```

## 2. package install :
```
cd backend
pnpm install
```

```
cd frontend
pnpm install
```

## To run the back end :
```
pnpm dev
```
---
## .env file structure :
```
# Database
DATABASE_URL="YOUR DB"

# Server
PORT=3000

# JWT
JWT_ACCESS_SECRET= create key secret search for token generator
JWT_REFRESH_SECRET= same
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=naftalpfc01@gmail.com
SMTP_PASS="dkas osge afqz twrz"
SMTP_FROM="Exit System <naftalpfc01@gmail.com>"

# Frontend URL (for reset password links)
CLIENT_URL=http://localhost:3000
```

---

## Prisma
#### Migration 
```
pnpm dlx prisma migrate dev --name init   
```
#### prisma studio (DB diagram)
```
npx prisma studio
```
#### Seed file 
```
pnpm prisma db seed
```
