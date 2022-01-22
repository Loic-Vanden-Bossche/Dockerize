import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {


  test() {
    console.log('calculs');

    return 'test';
  }
}
