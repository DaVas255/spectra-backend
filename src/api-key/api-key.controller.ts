import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
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
	getAll(@CurrentUser('id') userId: number) {
		return this.apiKeyService.getAll(userId)
	}

	@Delete(':id')
	@HttpCode(204)
	delete(@CurrentUser('id') userId: number, @Param('id') id: string) {
		return this.apiKeyService.delete(id, userId)
	}
}
