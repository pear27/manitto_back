import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
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

    const authCode = this.authService.generateOneTimeCode({
      accessToken: kakaoUser.accessToken,
      isNewUser: kakaoUser.isNewUser,
    });

    return res.redirect(`http://localhost:3000/oauth?authCode=${authCode}`);
    //   return res.json(kakaoUser); // message(✅ 로그인 성공!), isNewUser, accessToken
  }

  @Post('kakao/verify')
  async kakaoVerify(@Body('authCode') authCode: string) {
    const data = this.authService.consumeOneTimeCode(authCode);

    if (!data) {
      throw new UnauthorizedException(
        '유효하지 않거나 만료된 인증 코드입니다.',
      );
    }

    return {
      message: '✅ 로그인 성공!',
      accessToken: data.accessToken,
      isNewUser: data.isNewUser,
    };
  }
}
