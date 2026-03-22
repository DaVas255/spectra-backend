import { Module } from '@nestjs/common'

import { ErrorsController } from './errors.controller'
import { ErrorsService } from './errors.service'
import { ApiKeyModule } from 'src/api-key/api-key.module'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [ApiKeyModule],
	controllers: [ErrorsController],
	providers: [ErrorsService, PrismaService]
})
export class ErrorsModule {}
