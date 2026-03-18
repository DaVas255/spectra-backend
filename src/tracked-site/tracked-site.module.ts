import { Module } from '@nestjs/common'

import { TrackedSiteController } from './tracked-site.controller'
import { PublicTrackedSiteController } from './public-tracked-site.controller'
import { TrackedSiteService } from './tracked-site.service'
import { PrismaService } from 'src/prisma.service'
import { ApiKeyModule } from 'src/api-key/api-key.module'

@Module({
	imports: [ApiKeyModule],
	controllers: [TrackedSiteController, PublicTrackedSiteController],
	providers: [TrackedSiteService, PrismaService],
	exports: [TrackedSiteService]
})
export class TrackedSiteModule {}
