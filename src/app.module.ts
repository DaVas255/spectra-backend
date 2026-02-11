import { Module } from '@nestjs/common';
import { ErrorModule } from './error/error.module';

@Module({
  imports: [ErrorModule],
})
export class AppModule {}
