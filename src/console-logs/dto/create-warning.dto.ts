import {
	IsString,
	IsOptional,
	IsArray,
	ValidateNested,
	MaxLength
} from 'class-validator'
import { Type } from 'class-transformer'

export class SingleWarningDto {
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
}

export class CreateWarningDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SingleWarningDto)
	events: SingleWarningDto[]
}
