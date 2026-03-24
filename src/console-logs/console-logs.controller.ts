import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	Param,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
	ParseIntPipe
} from '@nestjs/common'

import { ConsoleLogsService } from './console-logs.service'
import { CreateWarningDto } from './dto/create-warning.dto'
import { CreateInfoDto } from './dto/create-info.dto'
import { CreateLogDto } from './dto/create-log.dto'
import { GetLogsDto } from './dto/get-logs.dto'

@Controller()
export class ConsoleLogsController {
	constructor(private readonly consoleLogsService: ConsoleLogsService) {}

	// ─── Warnings ───────────────────────────────────────────────────

	@Post('warnings')
	@HttpCode(200)
	@UsePipes(new ValidationPipe({ transform: true }))
	createWarnings(
		@Headers('x-api-key') apiKey: string,
		@Body() dto: CreateWarningDto
	) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.createWarnings(apiKey, dto)
	}

	@Get('warnings')
	@UsePipes(new ValidationPipe({ transform: true }))
	getWarnings(@Headers('x-api-key') apiKey: string, @Query() dto: GetLogsDto) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getWarnings(apiKey, dto)
	}

	@Get('warnings/:id')
	getWarningById(
		@Headers('x-api-key') apiKey: string,
		@Param('id', ParseIntPipe) id: number
	) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getWarningById(apiKey, id)
	}

	// ─── Infos ─────────────────────────────────────────────────────

	@Post('infos')
	@HttpCode(200)
	@UsePipes(new ValidationPipe({ transform: true }))
	createInfos(
		@Headers('x-api-key') apiKey: string,
		@Body() dto: CreateInfoDto
	) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.createInfos(apiKey, dto)
	}

	@Get('infos')
	@UsePipes(new ValidationPipe({ transform: true }))
	getInfos(@Headers('x-api-key') apiKey: string, @Query() dto: GetLogsDto) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getInfos(apiKey, dto)
	}

	@Get('infos/:id')
	getInfoById(
		@Headers('x-api-key') apiKey: string,
		@Param('id', ParseIntPipe) id: number
	) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getInfoById(apiKey, id)
	}

	// ─── Logs ──────────────────────────────────────────────────────

	@Post('logs')
	@HttpCode(200)
	@UsePipes(new ValidationPipe({ transform: true }))
	createLogs(@Headers('x-api-key') apiKey: string, @Body() dto: CreateLogDto) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.createLogs(apiKey, dto)
	}

	@Get('logs')
	@UsePipes(new ValidationPipe({ transform: true }))
	getLogs(@Headers('x-api-key') apiKey: string, @Query() dto: GetLogsDto) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getLogs(apiKey, dto)
	}

	@Get('logs/:id')
	getLogById(
		@Headers('x-api-key') apiKey: string,
		@Param('id', ParseIntPipe) id: number
	) {
		if (!apiKey) throw new Error('API key is required')
		return this.consoleLogsService.getLogById(apiKey, id)
	}
}
