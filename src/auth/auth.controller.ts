import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  // 카카오 로그인 창으로 리디렉션
  @Get('kakao/login')
  async kakaoLogin(@Res() res: Response) {
    const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI'); // <- auth/kakao/callback
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    return res.redirect(kakaoAuthUrl);
  }

  // 카카오에서 인가 코드를 받아 accessToken 요청
  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const kakaoToken = await this.authService.getKakaoToken(code);
    const kakaoUser = await this.authService.loginWithKakao(
      kakaoToken.access_token,
    );
    return res.json(kakaoUser); // 받은 token을 클라이언트에 응답
  }
}
