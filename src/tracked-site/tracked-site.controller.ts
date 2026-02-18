import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { TrackedSiteService } from './tracked-site.service'
import {
	CreateTrackedSiteDto,
	UpdateTrackedSiteDto
} from './dto/tracked-site.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'

@Controller('sites')
@Auth()
export class TrackedSiteController {
	constructor(private readonly trackedSiteService: TrackedSiteService) {}

	@Post()
	@UsePipes(new ValidationPipe())
	create(@CurrentUser('id') userId: number, @Body() dto: CreateTrackedSiteDto) {
		return this.trackedSiteService.create(userId, dto.url, dto.name)
	}

	@Get()
	findAll(@CurrentUser('id') userId: number) {
		return this.trackedSiteService.findAllByUser(userId)
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe())
	update(
		@CurrentUser('id') userId: number,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateTrackedSiteDto
	) {
		return this.trackedSiteService.update(id, userId, dto)
	}

	@Delete(':id')
	remove(
		@CurrentUser('id') userId: number,
		@Param('id', ParseIntPipe) id: number
	) {
		return this.trackedSiteService.remove(id, userId)
	}
}
