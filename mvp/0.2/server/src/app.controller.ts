import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'LyraClipMAP API' },
        version: { type: 'string', example: '0.2.0' },
        description: { type: 'string', example: 'API for managing music collection with synchronized lyrics' },
        documentation: { type: 'string', example: '/api-docs' },
      },
    },
  })
  getHello() {
    return this.appService.getApiInfo();
  }
}