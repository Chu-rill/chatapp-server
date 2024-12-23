import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { signToken } from 'src/utils/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { username, password: hashedPassword },
    });

    const token = await signToken(
      user.id,
      user.username,
      process.env.JWT_SECRET,
      this.jwt,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'user signup',
      access_token: token.access_token, // correctly extract access_token
    };
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await signToken(
      user.id,
      user.username,
      process.env.JWT_SECRET,
      this.jwt,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'user login',
      access_token: token.access_token, // correctly extract access_token
    };
  }
}
