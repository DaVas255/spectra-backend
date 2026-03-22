import {
	Body,
	Controller,
	Headers,
	HttpCode,
	Get,
	Param,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
	ParseIntPipe
} from '@nestjs/common'

import { ErrorsService } from './errors.service'
import { CreateErrorDto } from './dto/create-error.dto'
import { GetErrorsDto } from './dto/get-errors.dto'

@Controller('errors')
export class ErrorsController {
	constructor(private readonly errorsService: ErrorsService) {}

	@Post()
	@HttpCode(200)
	@UsePipes(new ValidationPipe({ transform: true }))
	create(@Headers('x-api-key') apiKey: string, @Body() dto: CreateErrorDto) {
		if (!apiKey) {
			throw new Error('API key is required')
		}
		return this.errorsService.createErrors(apiKey, dto)
	}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	findAll(@Headers('x-api-key') apiKey: string, @Query() dto: GetErrorsDto) {
		if (!apiKey) {
			throw new Error('API key is required')
		}
		return this.errorsService.getErrors(apiKey, dto)
	}

	@Get(':id')
	findOne(
		@Headers('x-api-key') apiKey: string,
		@Param('id', ParseIntPipe) id: number
	) {
		if (!apiKey) {
			throw new Error('API key is required')
		}
		return this.errorsService.getErrorById(apiKey, id)
	}
}
