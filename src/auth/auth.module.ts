import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // You can fetch from the config or environment variables
      signOptions: { expiresIn: '1h' }, // Optionally, configure the expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
