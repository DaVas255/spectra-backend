import { Injectable, BadRequestException } from '@nestjs/common'
import * as crypto from 'crypto'
import { PrismaService } from 'src/prisma.service'
import { EmailService } from '../email/email.service'

@Injectable()
export class EmailVerificationService {
	constructor(
		private prisma: PrismaService,
		private emailService: EmailService
	) {}

	async generateVerificationToken(userId: number) {
		const token = crypto.randomBytes(32).toString('hex')
		const expires = new Date()
		expires.setHours(expires.getHours() + 1) // 1 час

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				emailVerificationToken: token,
				emailVerificationExpires: expires
			}
		})

		return token
	}

	async sendVerificationEmail(userId: number, email: string) {
		const token = await this.generateVerificationToken(userId)
		await this.emailService.sendVerificationEmail(email, token)
	}

	async verifyEmail(token: string) {
		const user = await this.prisma.user.findUnique({
			where: { emailVerificationToken: token }
		})

		if (!user) {
			throw new BadRequestException('Неверный или истекший токен подтверждения')
		}

		if (user.isEmailVerified) {
			throw new BadRequestException('Email уже подтвержден')
		}

		if (
			!user.emailVerificationExpires ||
			user.emailVerificationExpires < new Date()
		) {
			throw new BadRequestException('Срок действия ссылки истек')
		}

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				isEmailVerified: true,
				emailVerificationToken: null,
				emailVerificationExpires: null
			}
		})

		return { message: 'Email успешно подтвержден' }
	}

	async resendVerification(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email }
		})

		if (!user) {
			throw new BadRequestException('Пользователь с таким email не найден')
		}

		if (user.isEmailVerified) {
			throw new BadRequestException('Email уже подтвержден')
		}

		await this.sendVerificationEmail(user.id, user.email)

		return { message: 'Письмо с подтверждением отправлено повторно' }
	}
}
