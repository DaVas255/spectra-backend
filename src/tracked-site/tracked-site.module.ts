import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { TrackedSiteController } from './tracked-site.controller'
import { TrackedSiteService } from './tracked-site.service'

@Module({
	controllers: [TrackedSiteController],
	providers: [TrackedSiteService, PrismaService],
	exports: [TrackedSiteService]
})
export class TrackedSiteModule {}
