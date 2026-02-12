/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'
import { AuthDto } from './dto/auth.dto'
import { EmailVerificationService } from './email-verification.service'
import { UserService } from './user.service'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private emailVerificationService: EmailVerificationService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)

		if (!user.isEmailVerified) {
			throw new ForbiddenException(
				'Пожалуйста, подтвердите ваш email перед входом'
			)
		}

		const { password, ...userWithoutPassword } = user
		const tokens = await this.issueTokens(user.id)

		return {
			user: userWithoutPassword,
			...tokens
		}
	}

	async register(dto: AuthDto) {
		const oldUser = await this.userService.getByEmail(dto.email)

		if (oldUser) throw new BadRequestException('User already exists')

		const user = await this.userService.create(dto)

		await this.emailVerificationService.sendVerificationEmail(
			user.id,
			user.email
		)

		const { password, ...userWithoutPassword } = user

		return {
			user: userWithoutPassword,
			message:
				'Регистрация успешна. Пожалуйста, проверьте ваш email для подтверждения аккаунта.'
		}
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const user = await this.userService.getById(result.id)

		if (!user) throw new UnauthorizedException('User not found')

		if (!user.isEmailVerified) {
			throw new ForbiddenException('Пожалуйста, подтвердите ваш email')
		}

		const tokens = await this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	private async issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user) throw new UnauthorizedException('Email or password invalid')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Email or password invalid')

		return user
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			// true if production
			secure: true,
			// lax if production
			sameSite: 'none'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			// true if production
			secure: true,
			// lax if production
			sameSite: 'none'
		})
	}
}
