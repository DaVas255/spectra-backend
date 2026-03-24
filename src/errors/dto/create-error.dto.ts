import {
	IsString,
	IsOptional,
	IsNumber,
	IsArray,
	ValidateNested,
	MaxLength
} from 'class-validator'
import { Type } from 'class-transformer'

export class ErrorMetadataDto {
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

export class SingleErrorDto {
	@IsString()
	@MaxLength(500)
	url: string

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
	@Type(() => ErrorMetadataDto)
	metadata?: ErrorMetadataDto
}

export class CreateErrorDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SingleErrorDto)
	events: SingleErrorDto[]
}
