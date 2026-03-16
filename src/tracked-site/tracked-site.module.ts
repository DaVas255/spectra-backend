import { Module } from '@nestjs/common'

import { TrackedSiteController } from './tracked-site.controller'
import { TrackedSiteService } from './tracked-site.service'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [TrackedSiteController],
	providers: [TrackedSiteService, PrismaService],
	exports: [TrackedSiteService]
})
export class TrackedSiteModule {}
