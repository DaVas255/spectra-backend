import { IsOptional, IsInt, Min, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { Transform } from 'class-transformer'

export class GetErrorsDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number = 1

	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	limit?: number = 20

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	siteId?: number

	@IsOptional()
	@IsDateString()
	from?: string

	@IsOptional()
	@IsDateString()
	to?: string

	@IsOptional()
	@Transform(({ value }) => value === 'true')
	isResolved?: boolean
}
