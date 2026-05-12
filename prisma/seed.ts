import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar usuários
  const senha = await bcrypt.hash('senha123', 10);

  const joao = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@email.com',
      password: senha,
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Souza',
      email: 'maria@email.com',
      password: senha,
    },
  });

  // Transações do João
  await prisma.transaction.createMany({
    data: [
      { type: 'INCOME', amount: 5000, description: 'Salário', userId: joao.id },
      { type: 'INCOME', amount: 800, description: 'Freelance website', userId: joao.id },
      { type: 'EXPENSE', amount: 1200, description: 'Aluguel', userId: joao.id },
      { type: 'EXPENSE', amount: 450, description: 'Supermercado', userId: joao.id },
      { type: 'EXPENSE', amount: 150, description: 'Conta de luz', userId: joao.id },
      { type: 'EXPENSE', amount: 89.90, description: 'Internet', userId: joao.id },
    ],
  });

  // Transações da Maria
  await prisma.transaction.createMany({
    data: [
      { type: 'INCOME', amount: 3500, description: 'Salário', userId: maria.id },
      { type: 'INCOME', amount: 200, description: 'Venda de livros usados', userId: maria.id },
      { type: 'EXPENSE', amount: 900, description: 'Aluguel', userId: maria.id },
      { type: 'EXPENSE', amount: 320, description: 'Supermercado', userId: maria.id },
      { type: 'EXPENSE', amount: 59.90, description: 'Streaming', userId: maria.id },
    ],
  });

  console.log('Seed concluído!');
  console.log(`Usuários criados: ${joao.email}, ${maria.email}`);
  console.log('Senha de todos os usuários: senha123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
