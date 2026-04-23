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

## To run the backend and frontend :
```
pnpm dev
```
---
## .env file structure :
```
# Database
DATABASE_URL="YOUR DB"

# Server
# Use 3001 locally so it doesn't collide with Next.js (3000)
PORT=3001

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

# Frontend -> API
# Create `frontend/.env.local` and set:
# NEXT_PUBLIC_API_URL=http://localhost:3001
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


## .env.local in frontend 
```
 NEXT_PUBLIC_API_URL=http://your-machine-IP:PORT-FOR-BACKEND
```


 ## How to scan 

 1. create a document in worker 
 2. approve it 
 3. download pdf 
 4. scan QR code 
 5. log in with employee credentials
 6. re-enter the scan 

 **QR CODE VALID** should show up if then everything is working