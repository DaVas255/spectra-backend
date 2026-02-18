import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class TrackedSiteService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, url: string, name?: string) {
		const normalizedUrl = this.normalizeUrl(url)

		const existing = await this.prisma.trackedSite.findUnique({
			where: {
				userId_url: {
					userId,
					url: normalizedUrl
				}
			}
		})

		if (existing) {
			throw new BadRequestException('Сайт уже отслеживается')
		}

		return this.prisma.trackedSite.create({
			data: {
				userId,
				url: normalizedUrl,
				name: name || null
			}
		})
	}

	async findAllByUser(userId: number) {
		return this.prisma.trackedSite.findMany({
			where: { userId },
			include: {
				_count: {
					select: { errors: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})
	}

	async update(id: number, userId: number, data: { name?: string; isActive?: boolean }) {
		return this.prisma.trackedSite.updateMany({
			where: { id, userId },
			data
		})
	}

	async remove(id: number, userId: number) {
		return this.prisma.trackedSite.deleteMany({
			where: { id, userId }
		})
	}

	async findByUserAndUrl(userId: number, url: string) {
		const normalizedUrl = this.normalizeUrl(url)
		return this.prisma.trackedSite.findFirst({
			where: {
				userId,
				url: normalizedUrl,
				isActive: true
			}
		})
	}

	private normalizeUrl(url: string): string {
		try {
			const urlObj = new URL(url)
			return `${urlObj.protocol}//${urlObj.hostname}`
		} catch {
			return url
		}
	}
}
