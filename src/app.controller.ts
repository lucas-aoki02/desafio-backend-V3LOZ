import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verificar se a API está rodando' })
  getStatus() {
    return {
      status: 'ok',
      message: 'API de Gerenciamento de Renda está rodando!',
      docs: '/api',
    };
  }
}
