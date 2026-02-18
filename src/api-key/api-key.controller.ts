import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UseGuards
} from '@nestjs/common'
import { ApiKeyService } from './api-key.service'
import { CreateApiKeyDto } from './dto/api-key.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'

@Controller('api-keys')
@Auth()
export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService) {}

	@Post()
	create(
		@CurrentUser('id') userId: number,
		@Body() dto: CreateApiKeyDto
	) {
		return this.apiKeyService.create(userId, dto.name)
	}

	@Get()
	findAll(@CurrentUser('id') userId: number) {
		return this.apiKeyService.findAllByUser(userId)
	}

	@Delete(':id')
	remove(
		@CurrentUser('id') userId: number,
		@Param('id') id: string
	) {
		return this.apiKeyService.revoke(id, userId)
	}
}
