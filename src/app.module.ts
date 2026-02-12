import { Module } from '@nestjs/common'
import { ErrorModule } from './error/error.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, ErrorModule]
})
export class AppModule {}
