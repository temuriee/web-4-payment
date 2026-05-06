yarn install
docker compose up -d

npm run prisma:push  
npm run prisma:generate
npm run prisma:studio

nest g res api/auth --no-spec
