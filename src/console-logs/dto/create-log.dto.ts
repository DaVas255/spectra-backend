import { IsString, IsArray, ValidateNested, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

export class SingleLogDto {
	@IsString()
	@MaxLength(500)
	url: string

	@IsString()
	@MaxLength(5000)
	message: string
}

export class CreateLogDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SingleLogDto)
	events: SingleLogDto[]
}
