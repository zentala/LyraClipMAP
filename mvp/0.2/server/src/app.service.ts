import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'LyraClipMAP API',
      version: '0.2.0',
      description: 'API for managing music collection with synchronized lyrics',
      documentation: '/api-docs',
    };
  }
}