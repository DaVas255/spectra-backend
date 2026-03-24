import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'
import { ApiKeyService } from 'src/api-key/api-key.service'
import { CreateWarningDto } from './dto/create-warning.dto'
import { CreateInfoDto } from './dto/create-info.dto'
import { CreateLogDto } from './dto/create-log.dto'
import { GetLogsDto } from './dto/get-logs.dto'

@Injectable()
export class ConsoleLogsService {
	constructor(
		private prisma: PrismaService,
		private apiKeyService: ApiKeyService
	) {}

	// ─── Warnings ─────────────────────────────────────────────────

	async createWarnings(apiKey: string, dto: CreateWarningDto) {
		const userId = await this.validateApiKey(apiKey)
		const siteIdMap = new Map<string, number>()
		let newCount = 0
		let groupedCount = 0

		for (const item of dto.events) {
			const siteId = await this.resolveSiteId(item.url, userId, siteIdMap)
			if (!siteId) continue

			const fingerprint = this.generateFingerprint(
				item.message,
				item.stackTrace
			)

			const existing = await this.prisma.warning.findFirst({
				where: { siteId, fingerprint }
			})

			if (existing) {
				await this.prisma.warning.update({
					where: { id: existing.id },
					data: { count: existing.count + 1, lastSeenAt: new Date() }
				})
				groupedCount++
			} else {
				await this.prisma.warning.create({
					data: {
						siteId,
						fingerprint,
						message: item.message,
						stackTrace: item.stackTrace,
						url: item.url,
						firstSeenAt: new Date(),
						lastSeenAt: new Date()
					}
				})
				newCount++
			}
		}

		return {
			received: dto.events.length,
			new: newCount,
			grouped: groupedCount
		}
	}

	async getWarnings(apiKey: string, dto: GetLogsDto) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItems(userId, 'warning', dto)
	}

	async getWarningById(apiKey: string, id: number) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItemById(userId, 'warning', id)
	}

	// ─── Infos ─────────────────────────────────────────────────────

	async createInfos(apiKey: string, dto: CreateInfoDto) {
		const userId = await this.validateApiKey(apiKey)
		const siteIdMap = new Map<string, number>()
		let newCount = 0
		let groupedCount = 0

		for (const item of dto.events) {
			const siteId = await this.resolveSiteId(item.url, userId, siteIdMap)
			if (!siteId) continue

			const fingerprint = this.generateFingerprint(item.message)

			const existing = await this.prisma.info.findFirst({
				where: { siteId, message: item.message, url: item.url }
			})

			if (existing) {
				await this.prisma.info.update({
					where: { id: existing.id },
					data: { count: existing.count + 1, lastSeenAt: new Date() }
				})
				groupedCount++
			} else {
				await this.prisma.info.create({
					data: {
						siteId,
						message: item.message,
						url: item.url,
						firstSeenAt: new Date(),
						lastSeenAt: new Date()
					}
				})
				newCount++
			}
		}

		return { received: dto.events.length, new: newCount, grouped: groupedCount }
	}

	async getInfos(apiKey: string, dto: GetLogsDto) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItems(userId, 'info', dto)
	}

	async getInfoById(apiKey: string, id: number) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItemById(userId, 'info', id)
	}

	// ─── Logs ─────────────────────────────────────────────────────

	async createLogs(apiKey: string, dto: CreateLogDto) {
		const userId = await this.validateApiKey(apiKey)
		const siteIdMap = new Map<string, number>()
		let newCount = 0
		let groupedCount = 0

		for (const item of dto.events) {
			const siteId = await this.resolveSiteId(item.url, userId, siteIdMap)
			if (!siteId) continue

			const existing = await this.prisma.log.findFirst({
				where: { siteId, message: item.message, url: item.url }
			})

			if (existing) {
				await this.prisma.log.update({
					where: { id: existing.id },
					data: { count: existing.count + 1, lastSeenAt: new Date() }
				})
				groupedCount++
			} else {
				await this.prisma.log.create({
					data: {
						siteId,
						message: item.message,
						url: item.url,
						firstSeenAt: new Date(),
						lastSeenAt: new Date()
					}
				})
				newCount++
			}
		}

		return { received: dto.events.length, new: newCount, grouped: groupedCount }
	}

	async getLogs(apiKey: string, dto: GetLogsDto) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItems(userId, 'log', dto)
	}

	async getLogById(apiKey: string, id: number) {
		const userId = await this.validateApiKey(apiKey)
		return this.getItemById(userId, 'log', id)
	}

	// ─── Private helpers ────────────────────────────────────────────

	private async validateApiKey(apiKey: string) {
		const validApiKey = await this.apiKeyService.validateKey(apiKey)
		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}
		return validApiKey.userId
	}

	private async resolveSiteId(
		url: string,
		userId: number,
		cache: Map<string, number>
	) {
		const urlObj = new URL(url)
		const siteUrl =
			`${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.slice(0, 500)

		let siteId = cache.get(siteUrl)
		if (siteId) return siteId

		const site = await this.prisma.trackedSite.findFirst({
			where: {
				userId,
				isActive: true,
				OR: [
					{ url: siteUrl },
					{ url: { startsWith: urlObj.host } },
					{ urlPattern: { not: null } }
				]
			}
		})

		if (site) {
			siteId = site.id
			cache.set(siteUrl, siteId)
		}

		return siteId
	}

	private generateFingerprint(message: string, stackTrace?: string): string {
		const content = stackTrace ? message + stackTrace.slice(0, 200) : message

		let hash = 0
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash
		}
		return Math.abs(hash).toString(36)
	}

	private async getItems(
		userId: number,
		type: 'warning' | 'info' | 'log',
		dto: GetLogsDto
	) {
		const { page = 1, limit = 20, siteId, from, to } = dto
		const skip = (page - 1) * limit

		const where: any = {}

		if (siteId) {
			where.siteId = siteId
			const site = await this.prisma.trackedSite.findFirst({
				where: { id: siteId, userId }
			})
			if (!site) throw new NotFoundException('Site not found')
		} else {
			where.site = { userId }
		}

		if (from || to) {
			where.lastSeenAt = {}
			if (from) where.lastSeenAt.gte = new Date(from)
			if (to) where.lastSeenAt.lte = new Date(to)
		}

		if (type === 'warning') {
			const [items, total] = await Promise.all([
				this.prisma.warning.findMany({
					where,
					skip,
					take: limit,
					orderBy: { lastSeenAt: 'desc' },
					include: { site: { select: { id: true, url: true, name: true } } }
				}),
				this.prisma.warning.count({ where })
			])
			return {
				items,
				pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
			}
		}

		if (type === 'info') {
			const [items, total] = await Promise.all([
				this.prisma.info.findMany({
					where,
					skip,
					take: limit,
					orderBy: { lastSeenAt: 'desc' },
					include: { site: { select: { id: true, url: true, name: true } } }
				}),
				this.prisma.info.count({ where })
			])
			return {
				items,
				pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
			}
		}

		const [items, total] = await Promise.all([
			this.prisma.log.findMany({
				where,
				skip,
				take: limit,
				orderBy: { lastSeenAt: 'desc' },
				include: { site: { select: { id: true, url: true, name: true } } }
			}),
			this.prisma.log.count({ where })
		])

		return {
			items,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
		}
	}

	private async getItemById(
		userId: number,
		type: 'warning' | 'info' | 'log',
		id: number
	) {
		if (type === 'warning') {
			const item = await this.prisma.warning.findFirst({
				where: { id, site: { userId } },
				include: { site: { select: { id: true, url: true, name: true } } }
			})
			if (!item) throw new NotFoundException('Warning not found')
			return item
		}

		if (type === 'info') {
			const item = await this.prisma.info.findFirst({
				where: { id, site: { userId } },
				include: { site: { select: { id: true, url: true, name: true } } }
			})
			if (!item) throw new NotFoundException('Info not found')
			return item
		}

		const item = await this.prisma.log.findFirst({
			where: { id, site: { userId } },
			include: { site: { select: { id: true, url: true, name: true } } }
		})
		if (!item) throw new NotFoundException('Log not found')
		return item
	}
}
