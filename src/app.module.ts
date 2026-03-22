import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ApiKeyModule } from './api-key/api-key.module'
import { TrackedSiteModule } from './tracked-site/tracked-site.module'
import { ErrorsModule } from './errors/errors.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		ApiKeyModule,
		TrackedSiteModule,
		ErrorsModule
	]
})
export class AppModule {}
