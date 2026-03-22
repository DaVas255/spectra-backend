import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'

@Injectable()
export class TrackedSiteService {
	constructor(private prisma: PrismaService) {}

	async create(
		userId: number,
		data: {
			url: string
			urlPattern?: string
			name?: string
			isActive?: boolean
		}
	) {
		return this.prisma.trackedSite.create({
			data: {
				userId,
				url: data.url,
				urlPattern: data.urlPattern,
				name: data.name,
				isActive: data.isActive ?? true
			}
		})
	}

	async getAll(userId: number) {
		return this.prisma.trackedSite.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' }
		})
	}

	async getById(id: number, userId: number) {
		const site = await this.prisma.trackedSite.findFirst({
			where: { id, userId }
		})

		if (!site) {
			throw new NotFoundException('Tracked site not found')
		}

		return site
	}

	async update(
		id: number,
		userId: number,
		data: {
			url?: string
			urlPattern?: string
			name?: string
			isActive?: boolean
		}
	) {
		await this.getById(id, userId)

		return this.prisma.trackedSite.update({
			where: { id },
			data
		})
	}

	async delete(id: number, userId: number) {
		await this.getById(id, userId)

		return this.prisma.trackedSite.delete({
			where: { id }
		})
	}

	async getActiveSites(userId: number) {
		return this.prisma.trackedSite.findMany({
			where: { userId, isActive: true }
		})
	}
}
