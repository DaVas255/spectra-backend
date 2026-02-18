import { IsOptional, IsString } from 'class-validator'

export class CreateApiKeyDto {
	@IsString()
	@IsOptional()
	name?: string
}

export class ApiKeyResponseDto {
	id: string
	key: string
	name: string | null
	isActive: boolean
	lastUsed: Date | null
	createdAt: Date
}
