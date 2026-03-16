import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ApiKeyService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, name?: string) {
		return this.prisma.apiKey.create({
			data: {
				userId,
				name,
				key: `sk_live_${crypto.randomUUID().replace(/-/g, '')}`
			}
		})
	}

	async getAll(userId: number) {
		return this.prisma.apiKey.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' }
		})
	}

	async getById(id: string, userId: number) {
		const apiKey = await this.prisma.apiKey.findFirst({
			where: { id, userId }
		})

		if (!apiKey) {
			throw new NotFoundException('API key not found')
		}

		return apiKey
	}

	async delete(id: string, userId: number) {
		await this.getById(id, userId)

		return this.prisma.apiKey.delete({
			where: { id }
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
