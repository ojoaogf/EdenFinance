import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET')!,
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    // Supabase envia o ID do usuário no campo 'sub'
    if (!payload || !payload.sub) {
      throw new UnauthorizedException(
        'Token inválido ou sem identificação de usuário.',
      );
    }

    const singleUserMode =
      this.configService.get<string>('SINGLE_USER_MODE') !== 'false';
    const allowedUserEmail =
      this.configService.get<string>('ALLOWED_USER_EMAIL') ??
      'ojoaogabrielf@gmail.com';

    if (
      singleUserMode &&
      (!payload.email ||
        payload.email.toLowerCase() !== allowedUserEmail.toLowerCase())
    ) {
      throw new UnauthorizedException(
        'Usuário não autorizado para este sistema',
      );
    }

    // Não consultamos mais o banco de dados para validar o perfil.
    // Apenas retornamos os dados do token.
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
