import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator'

export class CreateTrackedSiteDto {
	@IsString()
	@MaxLength(500)
	url: string

	@IsOptional()
	@IsString()
	@MaxLength(500)
	urlPattern?: string

	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string

	@IsOptional()
	@IsBoolean()
	isActive?: boolean
}
