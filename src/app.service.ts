import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === 1) console.log('🍃 MongoDB connected!');
    else
      this.connection.once('open', () => {
        console.log('🍃 MongoDB connected!');
      });
  }
}
