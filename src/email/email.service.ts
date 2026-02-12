import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Transporter, createTransport } from 'nodemailer'

@Injectable()
export class EmailService {
	private transporter: Transporter

	constructor(private configService: ConfigService) {
		this.transporter = createTransport({
			host: this.configService.get<string>('SMTP_HOST'),
			port: this.configService.get<number>('SMTP_PORT'),
			secure: this.configService.get<boolean>('SMTP_SECURE'),
			auth: {
				user: this.configService.get<string>('SMTP_USER'),
				pass: this.configService.get<string>('SMTP_PASSWORD')
			},
			tls: {
				rejectUnauthorized: false
			}
		})
	}

	async sendVerificationEmail(email: string, token: string) {
		const apiUrl =
			this.configService.get<string>('API_URL') || 'http://localhost:4200/api'
		const verificationUrl = `${apiUrl}/auth/verify-email/${token}`
		const from = this.configService.get<string>('SMTP_FROM')

		const mailOptions = {
			from,
			to: email,
			subject: 'Подтверждение email адреса',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Подтверждение email адреса</h2>
					<p>Здравствуйте!</p>
					<p>Для завершения регистрации необходимо подтвердить ваш email адрес. Нажмите на кнопку ниже:</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}" 
						   style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
							Подтвердить email
						</a>
					</div>
					<p>Или скопируйте эту ссылку в браузер:</p>
					<p style="word-break: break-all; color: #666;">${verificationUrl}</p>
					<p style="color: #999; font-size: 12px;">Ссылка действительна в течение 1 часа.</p>
					<p style="color: #999; font-size: 12px;">Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
				</div>
			`
		}

		return this.transporter.sendMail(mailOptions)
	}
}
