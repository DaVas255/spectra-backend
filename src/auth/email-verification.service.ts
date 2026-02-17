import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import { PrismaService } from 'src/prisma.service'
import { EmailService } from '../email/email.service'

const VERIFICATION_TOKEN_EXPIRY_HOURS = 1
const RESEND_COOLDOWN_MINUTES = 1
const MAX_VERIFICATION_ATTEMPTS = 5

@Injectable()
export class EmailVerificationService {
	constructor(
		private prisma: PrismaService,
		private emailService: EmailService
	) {}

	async generateVerificationToken(userId: number): Promise<string> {
		const token = crypto.randomBytes(32).toString('hex')

		const expires = new Date()
		expires.setHours(expires.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS)

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				emailVerificationToken: token,
				emailVerificationExpires: expires,
				verificationAttempts: { increment: 1 }
			}
		})

		return token
	}

	async sendVerificationEmail(userId: number, email: string): Promise<void> {
		const token = await this.generateVerificationToken(userId)
		await this.emailService.sendVerificationEmail(email, token)

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				lastVerificationEmailSent: new Date()
			}
		})
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
				emailVerificationExpires: null,
				verificationAttempts: 0,
				lastVerificationEmailSent: null
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

		if (user.lastVerificationEmailSent) {
			const timeSinceLastEmail =
				Date.now() - user.lastVerificationEmailSent.getTime()
			const cooldownMs = RESEND_COOLDOWN_MINUTES * 60 * 1000

			if (timeSinceLastEmail < cooldownMs) {
				const remainingSeconds = Math.ceil(
					(cooldownMs - timeSinceLastEmail) / 1000
				)
				throw new BadRequestException(
					`Пожалуйста, подождите ${remainingSeconds} секунд перед повторной отправкой`
				)
			}
		}

		if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
			throw new BadRequestException(
				`Превышено максимальное количество попыток (${MAX_VERIFICATION_ATTEMPTS}). ` +
					'Пожалуйста, обратитесь в поддержку.'
			)
		}

		if (
			user.emailVerificationToken &&
			user.emailVerificationExpires &&
			user.emailVerificationExpires > new Date()
		) {
			await this.emailService.sendVerificationEmail(
				email,
				user.emailVerificationToken
			)

			await this.prisma.user.update({
				where: { id: user.id },
				data: {
					lastVerificationEmailSent: new Date()
				}
			})
		} else {
			await this.sendVerificationEmail(user.id, user.email)
		}

		return { message: 'Письмо с подтверждением отправлено повторно' }
	}
}
