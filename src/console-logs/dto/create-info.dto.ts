import { IsString, IsArray, ValidateNested, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

export class SingleInfoDto {
	@IsString()
	@MaxLength(500)
	url: string

	@IsString()
	@MaxLength(5000)
	message: string
}

export class CreateInfoDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SingleInfoDto)
	events: SingleInfoDto[]
}
