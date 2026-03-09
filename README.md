# Fitness Coach – Backend

API NestJS do Fitness Coach (Épico 1: auth, onboarding, plano semanal).

## Rodar

```bash
# Subir Postgres (na raiz)
docker compose up -d

# Backend
cd backend
cp .env.example .env   # ajustar se necessário
npm install
npx prisma migrate dev
npm run start:dev
```

API: `http://localhost:3000/api/v1`
