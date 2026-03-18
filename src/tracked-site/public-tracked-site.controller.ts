import {
	Controller,
	Get,
	Headers,
	NotFoundException
} from '@nestjs/common'

import { ApiKeyService } from 'src/api-key/api-key.service'
import { TrackedSiteService } from './tracked-site.service'

@Controller('public/tracked-sites')
export class PublicTrackedSiteController {
	constructor(
		private readonly trackedSiteService: TrackedSiteService,
		private readonly apiKeyService: ApiKeyService
	) {}

	@Get()
	async getSites(@Headers('x-api-key') apiKey: string) {
		if (!apiKey) {
			throw new NotFoundException('API key is required')
		}

		const validApiKey = await this.apiKeyService.validateKey(apiKey)

		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}

		return this.trackedSiteService.getAll(validApiKey.userId)
	}
}
