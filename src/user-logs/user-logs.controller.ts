import {
	Body,
	Controller,
	Headers,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'

import { UserLogsService } from './user-logs.service'
import { CreateUserLogDto } from './dto/create-user-log.dto'

@Controller('user-logs')
export class UserLogsController {
	constructor(private readonly userLogsService: UserLogsService) {}

	@Post()
	@HttpCode(200)
	@UsePipes(new ValidationPipe({ transform: true }))
	create(
		@Headers('x-api-key') apiKey: string,
		@Body() dto: CreateUserLogDto
	) {
		if (!apiKey) {
			throw new Error('API key is required')
		}
		return this.userLogsService.createLogs(apiKey, dto)
	}
}
