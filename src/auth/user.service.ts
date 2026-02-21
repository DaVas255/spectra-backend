import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { PrismaService } from 'src/prisma.service'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUsers() {
		return this.prisma.user.findMany({
			select: {
				name: true,
				email: true,
				id: true,
				password: false
			}
		})
	}

	async getById(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				isEmailVerified: true
			}
		})
	}

	async getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async getByVerificationToken(token: string) {
		return this.prisma.user.findUnique({
			where: {
				emailVerificationToken: token
			}
		})
	}

	async create(dto: AuthDto) {
		return this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.email,
				password: await hash(dto.password)
			}
		})
	}
}
