import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'
import { ApiKeyService } from 'src/api-key/api-key.service'
import { CreateErrorDto } from './dto/create-error.dto'
import { GetErrorsDto } from './dto/get-errors.dto'

@Injectable()
export class ErrorsService {
	constructor(
		private prisma: PrismaService,
		private apiKeyService: ApiKeyService
	) {}

	async createErrors(apiKey: string, dto: CreateErrorDto) {
		const validApiKey = await this.apiKeyService.validateKey(apiKey)

		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}

		const userId = validApiKey.userId
		const siteIdMap = new Map<string, number>()
		let newErrorsCount = 0
		let groupedErrorsCount = 0

		for (const error of dto.errors) {
			const urlObj = new URL(error.url)
			const siteUrl =
				`${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.slice(0, 500)

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
				const fingerprint = this.generateFingerprint(error)

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
							type: error.metadata?.browser || 'javascript',
							message: error.message,
							stackTrace: error.stackTrace,
							fileName: error.fileName,
							lineNumber: error.lineNumber,
							columnNumber: error.columnNumber,
							url: error.url,
							userAgent: error.metadata?.userAgent,
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

		return {
			received: dto.errors.length,
			new: newErrorsCount,
			grouped: groupedErrorsCount
		}
	}

	private generateFingerprint(error: {
		message: string
		stackTrace?: string
	}): string {
		const content = error.stackTrace
			? error.message + error.stackTrace.slice(0, 200)
			: error.message

		let hash = 0
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash
		}
		return Math.abs(hash).toString(36)
	}

	async getErrors(apiKey: string, dto: GetErrorsDto) {
		const validApiKey = await this.apiKeyService.validateKey(apiKey)

		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}

		const userId = validApiKey.userId
		const { page = 1, limit = 20, siteId, from, to } = dto
		const skip = (page - 1) * limit

		const where: any = {}

		if (siteId) {
			where.siteId = siteId
			const site = await this.prisma.trackedSite.findFirst({
				where: { id: siteId, userId }
			})
			if (!site) {
				throw new NotFoundException('Site not found')
			}
		} else {
			where.site = { userId }
		}

		if (from || to) {
			where.lastSeenAt = {}
			if (from) where.lastSeenAt.gte = new Date(from)
			if (to) where.lastSeenAt.lte = new Date(to)
		}

		const [errors, total] = await Promise.all([
			this.prisma.error.findMany({
				where,
				skip,
				take: limit,
				orderBy: { lastSeenAt: 'desc' },
				include: {
					site: {
						select: { id: true, url: true, name: true }
					}
				}
			}),
			this.prisma.error.count({ where })
		])

		return {
			errors,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		}
	}

	async getErrorById(apiKey: string, errorId: number) {
		const validApiKey = await this.apiKeyService.validateKey(apiKey)

		if (!validApiKey) {
			throw new NotFoundException('Invalid API key')
		}

		const userId = validApiKey.userId

		const error = await this.prisma.error.findFirst({
			where: {
				id: errorId,
				site: { userId }
			},
			include: {
				site: {
					select: { id: true, url: true, name: true }
				}
			}
		})

		if (!error) {
			throw new NotFoundException('Error not found')
		}

		return error
	}
}
