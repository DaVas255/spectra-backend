import { Injectable, BadRequestException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'
import { ApiKeyModel } from 'src/generated/prisma/models/ApiKey'

@Injectable()
export class ApiKeyService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, name?: string) {
		const existingKey = await this.prisma.apiKey.findUnique({
			where: { userId }
		})

		if (existingKey) {
			throw new BadRequestException(
				'У вас уже есть API ключ. Удалите существующий ключ, чтобы создать новый.'
			)
		}

		return this.prisma.apiKey.create({
			data: {
				userId,
				name,
				key: `sk_live_${crypto.randomUUID().replace(/-/g, '')}`
			}
		})
	}

	async get(userId: number): Promise<ApiKeyModel | null> {
		return this.prisma.apiKey.findUnique({
			where: { userId }
		})
	}

	async deleteByUserId(userId: number) {
		return this.prisma.apiKey.delete({
			where: { userId }
		})
	}

	async validateKey(key: string) {
		const apiKey = await this.prisma.apiKey.findUnique({
			where: { key },
			include: { user: true }
		})

		if (!apiKey || !apiKey.isActive) {
			return null
		}

		await this.prisma.apiKey.update({
			where: { id: apiKey.id },
			data: { lastUsed: new Date() }
		})

		return apiKey
	}
}
