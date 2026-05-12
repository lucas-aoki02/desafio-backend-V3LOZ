import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../src/transactions/transactions.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;

  // Mock do PrismaService
  const mockPrisma = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma transação', async () => {
      const dto = { type: 'INCOME', amount: 1000, description: 'Salário' };
      mockPrisma.transaction.create.mockResolvedValue({ id: '1', ...dto, userId: 'user1' });

      const result = await service.create('user1', dto);

      expect(result.type).toBe('INCOME');
      expect(result.amount).toBe(1000);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve listar as transações do usuário', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { id: '1', type: 'INCOME', amount: 1000, description: 'Salário', userId: 'user1' },
        { id: '2', type: 'EXPENSE', amount: 200, description: 'Conta de luz', userId: 'user1' },
      ]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('deve atualizar uma transação existente', async () => {
      const dto = { type: 'EXPENSE', amount: 300, description: 'Conta atualizada' };
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: '1', userId: 'user1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: '1', ...dto });

      const result = await service.update('1', 'user1', dto);

      expect(result.amount).toBe(300);
    });

    it('deve rejeitar se a transação não existir', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.update('999', 'user1', { type: 'INCOME', amount: 100, description: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma transação', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: '1', userId: 'user1' });
      mockPrisma.transaction.delete.mockResolvedValue({});

      const result = await service.remove('1', 'user1');

      expect(result.message).toBe('Transação removida com sucesso');
    });

    it('deve rejeitar se a transação não existir', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.remove('999', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('summary', () => {
    it('deve retornar o resumo financeiro', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { type: 'INCOME', amount: 3000 },
        { type: 'INCOME', amount: 500 },
        { type: 'EXPENSE', amount: 800 },
        { type: 'EXPENSE', amount: 200 },
      ]);

      const result = await service.summary('user1');

      expect(result.totalIncome).toBe(3500);
      expect(result.totalExpense).toBe(1000);
      expect(result.balance).toBe(2500);
    });

    it('deve retornar zero quando não há transações', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.summary('user1');

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.balance).toBe(0);
    });
  });
});
