import {
	IsString,
	IsOptional,
	IsNumber,
	IsEnum,
	IsArray,
	ValidateNested,
	MaxLength
} from 'class-validator'
import { Type } from 'class-transformer'

export enum LogLevel {
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info',
	LOG = 'log'
}

export class LogMetadataDto {
	@IsOptional()
	@IsString()
	userAgent?: string

	@IsOptional()
	@IsString()
	viewport?: string

	@IsOptional()
	@IsString()
	os?: string

	@IsOptional()
	@IsString()
	browser?: string
}

export class SingleLogDto {
	@IsString()
	@MaxLength(500)
	url: string

	@IsEnum(LogLevel)
	level: LogLevel

	@IsString()
	@MaxLength(5000)
	message: string

	@IsOptional()
	@IsString()
	@MaxLength(10000)
	stackTrace?: string

	@IsOptional()
	@IsString()
	@MaxLength(500)
	fileName?: string

	@IsOptional()
	@IsNumber()
	lineNumber?: number

	@IsOptional()
	@IsNumber()
	columnNumber?: number

	@IsOptional()
	@ValidateNested()
	@Type(() => LogMetadataDto)
	metadata?: LogMetadataDto
}

export class CreateUserLogDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SingleLogDto)
	logs: SingleLogDto[]
}
