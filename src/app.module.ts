import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ApiKeyModule } from './api-key/api-key.module'

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, ApiKeyModule]
})
export class AppModule {}
