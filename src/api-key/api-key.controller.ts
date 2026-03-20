import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'

import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { ApiKeyService } from './api-key.service'
import { CreateApiKeyDto } from './dto/create-api-key.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('api-keys')
@Auth()
export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService) {}

	@Post()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	create(@CurrentUser('id') userId: number, @Body() dto: CreateApiKeyDto) {
		return this.apiKeyService.create(userId, dto.name)
	}

	@Get()
	get(@CurrentUser('id') userId: number) {
		return this.apiKeyService.get(userId)
	}

	@Delete()
	@HttpCode(204)
	delete(@CurrentUser('id') userId: number) {
		return this.apiKeyService.deleteByUserId(userId)
	}
}
