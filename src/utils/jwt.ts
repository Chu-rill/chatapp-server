import { JwtService } from '@nestjs/jwt';

export async function signToken(
  userId: number,
  username: string,
  secret: string,
  jwtService: JwtService,
): Promise<{ access_token: string }> {
  const payload = { sub: userId, username };

  const token = await jwtService.signAsync(payload, {
    expiresIn: '1h',
    secret: secret,
  });

  return { access_token: token };
}
