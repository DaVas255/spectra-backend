import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class CreateTrackedSiteDto {
	@IsString()
	url: string

	@IsString()
	@IsOptional()
	name?: string
}

export class UpdateTrackedSiteDto {
	@IsString()
	@IsOptional()
	name?: string

	@IsBoolean()
	@IsOptional()
	isActive?: boolean
}
