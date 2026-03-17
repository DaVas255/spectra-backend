import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'
import { ApiKeyService } from 'src/api-key/api-key.service'
import { CreateUserLogDto } from './dto/create-user-log.dto'

@Injectable()
export class UserLogsService {
	constructor(
		private prisma: PrismaService,
		private apiKeyService: ApiKeyService
	) {}

	async createLogs(apiKey: string, dto: CreateUserLogDto) {
		const validApiKey = await this.apiKeyService.validateKey(apiKey)

		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}

		const userId = validApiKey.userId
		const siteIdMap = new Map<string, number>()
		let newErrorsCount = 0
		let groupedErrorsCount = 0

		for (const log of dto.logs) {
			const urlObj = new URL(log.url)
			const siteUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.slice(0, 500)

			let siteId = siteIdMap.get(siteUrl)

			if (!siteId) {
				const site = await this.prisma.trackedSite.findFirst({
					where: {
						userId,
						isActive: true,
						OR: [
							{ url: siteUrl },
							{ url: { startsWith: urlObj.host } },
							{
								urlPattern: {
									not: null
								}
							}
						]
					}
				})

				if (site) {
					siteId = site.id
					siteIdMap.set(siteUrl, siteId)
				}
			}

			if (siteId) {
				const fingerprint = this.generateFingerprint(log)

				const existingError = await this.prisma.error.findFirst({
					where: {
						siteId,
						fingerprint
					}
				})

				if (existingError) {
					await this.prisma.error.update({
						where: { id: existingError.id },
						data: {
							count: existingError.count + 1,
							lastSeenAt: new Date(),
							lastInstanceId: crypto.randomUUID()
						}
					})
					groupedErrorsCount++
				} else {
					await this.prisma.error.create({
						data: {
							siteId,
							type: log.metadata?.browser || 'javascript',
							level: log.level,
							message: log.message,
							stackTrace: log.stackTrace,
							fileName: log.fileName,
							lineNumber: log.lineNumber,
							columnNumber: log.columnNumber,
							url: log.url,
							userAgent: log.metadata?.userAgent,
							fingerprint,
							firstSeenAt: new Date(),
							lastSeenAt: new Date(),
							lastInstanceId: crypto.randomUUID()
						}
					})
					newErrorsCount++
				}
			}
		}

		return { received: dto.logs.length, new: newErrorsCount, grouped: groupedErrorsCount }
	}

	private generateFingerprint(log: { message: string; stackTrace?: string }): string {
		const content = log.stackTrace
			? log.message + log.stackTrace.slice(0, 200)
			: log.message

		let hash = 0
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash
		}
		return Math.abs(hash).toString(36)
	}
}
