import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'

import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { TrackedSiteService } from './tracked-site.service'
import { CreateTrackedSiteDto } from './dto/create-tracked-site.dto'
import { UpdateTrackedSiteDto } from './dto/update-tracked-site.dto'
import { PrismaService } from 'src/prisma.service'

@Controller('tracked-sites')
@Auth()
export class TrackedSiteController {
	constructor(
		private readonly trackedSiteService: TrackedSiteService,
		private prisma: PrismaService
	) {}

	@Post()
	@HttpCode(201)
	@UsePipes(new ValidationPipe())
	async create(
		@CurrentUser('id') userId: number,
		@Body() dto: CreateTrackedSiteDto
	) {
		const existing = await this.prisma.trackedSite.findFirst({
			where: { userId, url: dto.url }
		})

		if (existing) {
			throw new BadRequestException('Сайт с таким URL уже добавлен')
		}

		return this.trackedSiteService.create(userId, dto)
	}

	@Get()
	getAll(@CurrentUser('id') userId: number) {
		return this.trackedSiteService.getAll(userId)
	}

	@Get(':id')
	getById(
		@CurrentUser('id') userId: number,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.trackedSiteService.getById(id, userId)
	}

	@Put(':id')
	async update(
		@CurrentUser('id') userId: number,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateTrackedSiteDto
	) {
		const duplicate = await this.prisma.trackedSite.findFirst({
			where: {
				userId,
				url: dto.url,
				id: { not: id }
			}
		})

		if (duplicate) {
			throw new BadRequestException('Сайт с таким URL уже существует')
		}

		return this.trackedSiteService.update(id, userId, dto)
	}

	@Delete(':id')
	@HttpCode(204)
	delete(
		@CurrentUser('id') userId: number,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.trackedSiteService.delete(id, userId)
	}
}
