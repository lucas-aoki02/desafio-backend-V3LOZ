import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        userId: userId,
      },
    });

    return transaction;
  }

  async findAll(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  async update(id: string, userId: string, dto: CreateTransactionDto) {
    // Verificar se a transação existe e pertence ao usuário
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: id, userId: userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: id },
      data: {
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    // Verificar se a transação existe e pertence ao usuário
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: id, userId: userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    await this.prisma.transaction.delete({
      where: { id: id },
    });

    return { message: 'Transação removida com sucesso' };
  }

  async summary(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId: userId },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += Number(t.amount);
      } else {
        totalExpense += Number(t.amount);
      }
    }

    return {
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
