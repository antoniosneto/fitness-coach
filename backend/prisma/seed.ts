/**
 * Seed TACO – alimentos base na tabela FOOD (refinamento 2.4).
 * Associado ao tenant "default". Sem dependência de APIs externas.
 * Execução: npx prisma db seed
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const FOODS_SEED = [
  { description: 'Arroz branco cozido', kcal: 130, proteinG: 2.7, carbG: 28.2, fatG: 0.3 },
  { description: 'Feijão preto cozido', kcal: 132, proteinG: 8.9, carbG: 23.7, fatG: 0.5 },
  { description: 'Frango grelhado (peito)', kcal: 165, proteinG: 31, carbG: 0, fatG: 3.6 },
  { description: 'Ovo cozido', kcal: 155, proteinG: 13, carbG: 1.1, fatG: 11 },
  { description: 'Batata doce cozida', kcal: 86, proteinG: 1.6, carbG: 20.1, fatG: 0.1 },
  { description: 'Banana nanica', kcal: 89, proteinG: 1.1, carbG: 22.8, fatG: 0.3 },
  { description: 'Brócolis cozido', kcal: 35, proteinG: 2.4, carbG: 7.2, fatG: 0.4 },
  { description: 'Atum em água', kcal: 116, proteinG: 26, carbG: 0, fatG: 0.8 },
  { description: 'Aveia em flocos', kcal: 389, proteinG: 16.9, carbG: 66.3, fatG: 6.9 },
  { description: 'Whey protein (1 scoop)', kcal: 120, proteinG: 24, carbG: 3, fatG: 1.5 },
];

async function main() {
  let tenant = await prisma.tenant.findFirst({ where: { name: 'default' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'default' } });
    console.log('Tenant "default" criado.');
  }

  const existing = await prisma.food.count({ where: { tenantId: tenant.tenantId } });
  if (existing > 0) {
    console.log(`Seed TACO: já existem ${existing} alimentos no tenant default. Nenhum registro duplicado.`);
    return;
  }

  await prisma.food.createMany({
    data: FOODS_SEED.map((f) => ({
      tenantId: tenant!.tenantId,
      description: f.description,
      kcal: f.kcal,
      proteinG: f.proteinG,
      carbG: f.carbG,
      fatG: f.fatG,
    })),
  });
  console.log(`Seed TACO: ${FOODS_SEED.length} alimentos inseridos no tenant default.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
