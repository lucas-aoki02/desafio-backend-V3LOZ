import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Mock do PrismaService
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  // Mock do JwtService
  const mockJwt = {
    sign: jest.fn().mockReturnValue('token-fake-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve cadastrar um novo usuário', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        name: 'João',
        email: 'joao@email.com',
        password: 'hash',
      });

      const result = await authService.register({
        name: 'João',
        email: 'joao@email.com',
        password: 'senha123',
      });

      expect(result).toEqual({
        id: '1',
        name: 'João',
        email: 'joao@email.com',
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('deve rejeitar e-mail duplicado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        authService.register({
          name: 'João',
          email: 'joao@email.com',
          password: 'senha123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('deve retornar um token JWT', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@email.com',
        password: hashedPassword,
      });

      const result = await authService.login({
        email: 'joao@email.com',
        password: 'senha123',
      });

      expect(result).toEqual({ access_token: 'token-fake-123' });
      expect(mockJwt.sign).toHaveBeenCalled();
    });

    it('deve rejeitar e-mail inexistente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'naoexiste@email.com',
          password: 'senha123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve rejeitar senha incorreta', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@email.com',
        password: hashedPassword,
      });

      await expect(
        authService.login({
          email: 'joao@email.com',
          password: 'senhaerrada',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
