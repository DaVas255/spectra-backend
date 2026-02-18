import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma.service'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'

@Module({
	imports: [ConfigModule],
	controllers: [ApiKeyController],
	providers: [ApiKeyService, PrismaService],
	exports: [ApiKeyService]
})
export class ApiKeyModule {}
