import { Module } from '@nestjs/common'

import { UserLogsController } from './user-logs.controller'
import { UserLogsService } from './user-logs.service'
import { PrismaService } from 'src/prisma.service'
import { ApiKeyService } from 'src/api-key/api-key.service'

@Module({
	controllers: [UserLogsController],
	providers: [UserLogsService, PrismaService, ApiKeyService],
	exports: [UserLogsService]
})
export class UserLogsModule {}
