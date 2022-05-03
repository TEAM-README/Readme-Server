import { Injectable } from '@nestjs/common';
import { ApiResponse } from './types/global';

@Injectable()
export class AppService {
  getHello(): ApiResponse<string> {
    return {
      message: 'Get Hello 성공',
      data: 'Hello World!',
    };
  }
}
