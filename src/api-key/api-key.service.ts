import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ApiKeyService {
	constructor(
		private prisma: PrismaService,
		private configService: ConfigService
	) {}

	async create(userId: number, name?: string) {
		const keyId = this.generateKeyId()
		const key = this.generateApiKey(userId, keyId)

		const apiKey = await this.prisma.apiKey.create({
			data: {
				key,
				userId,
				name: name || null
			}
		})

		return {
			id: apiKey.id,
			key: apiKey.key,
			name: apiKey.name,
			isActive: apiKey.isActive,
			lastUsed: apiKey.lastUsed,
			createdAt: apiKey.createdAt
		}
	}

	async findAllByUser(userId: number) {
		return this.prisma.apiKey.findMany({
			where: { userId },
			select: {
				id: true,
				key: true,
				name: true,
				isActive: true,
				lastUsed: true,
				createdAt: true
			}
		})
	}

	async revoke(id: string, userId: number) {
		return this.prisma.apiKey.deleteMany({
			where: { id, userId }
		})
	}

	async validateAndGetUser(apiKey: string) {
		if (!this.verifyApiKey(apiKey)) {
			return null
		}

		const keyRecord = await this.prisma.apiKey.findUnique({
			where: { key: apiKey },
			include: { user: true }
		})

		if (!keyRecord || !keyRecord.isActive) {
			return null
		}

		await this.prisma.apiKey.update({
			where: { id: keyRecord.id },
			data: { lastUsed: new Date() }
		})

		return {
			userId: keyRecord.userId,
			user: keyRecord.user
		}
	}

	private generateKeyId(): string {
		return Math.random().toString(36).substring(2, 15)
	}

	private generateApiKey(userId: number, keyId: string): string {
		const secret = this.configService.get<string>('API_KEY_SECRET')
		const payload = Buffer.from(
			JSON.stringify({
				userId,
				keyId,
				createdAt: Date.now()
			})
		).toString('base64url')

		const signature = createHmac('sha256', secret!)
			.update(payload)
			.digest('base64url')

		return `spectra.${payload}.${signature}`
	}

	private verifyApiKey(apiKey: string): boolean {
		if (!apiKey.startsWith('spectra.')) {
			return false
		}

		const parts = apiKey.split('.')
		if (parts.length !== 3) {
			return false
		}

		const [, payload, signature] = parts
		const secret = this.configService.get<string>('API_KEY_SECRET')

		const expectedSignature = createHmac('sha256', secret!)
			.update(payload)
			.digest('base64url')

		return signature === expectedSignature
	}
}
