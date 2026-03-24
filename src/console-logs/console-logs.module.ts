import { Module } from '@nestjs/common'
import { ConsoleLogsController } from './console-logs.controller'
import { ConsoleLogsService } from './console-logs.service'
import { ApiKeyModule } from 'src/api-key/api-key.module'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [ApiKeyModule],
	controllers: [ConsoleLogsController],
	providers: [ConsoleLogsService, PrismaService]
})
export class ConsoleLogsModule {}
