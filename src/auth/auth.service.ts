import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  // 카카오에서 인가 코드를 받아 accessToken 요청
  async getKakaoToken(code: string) {
    const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');
    const clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET');

    if (!clientId || !redirectUri || !clientSecret) {
      throw new Error(
        'KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI, 또는 KAKAO_CLIENT_SECRET이 설정되지 않았습니다.',
      );
    }
    const payload = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      client_secret: clientSecret,
      code,
    });

    /*
    if (clientSecret) {
      // Client Secret 사용하는 경우 append
      payload.append('client_secret', clientSecret);
    }*/

    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      payload.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return response.data; // access_token, refresh_token, expires_in
  }

  // 카카오에서 accessToken을 받아 사용자 프로필 요청
  async getKakaoUserInfo(accessToken: string) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const kakaoProfile = response.data;
      return kakaoProfile;
    } catch (error) {
      console.error('❌ Fail to request Kakao user info:', error);
      throw new Error('❌ Fail to request Kakao user info');
    }
  }

  // 카카오에서 사용자 프로필을 받아 계정 생성 및 accessToken(manitto server) 생성
  async loginWithKakao(accessToken: string) {
    const kakaoUser = await this.getKakaoUserInfo(accessToken);
    const kakaoId = kakaoUser.id;

    let user = await this.usersRepository.findOneByKakaoId(kakaoId);

    if (!user) {
      user = await this.usersRepository.create({
        kakaoId,
      });
    }
    const jwt = this.jwtService.sign({ userId: user.kakaoId });

    return {
      message: '✅ 로그인 성공!',
      isNewUser: !user.nickname,
      accessToken: jwt,
    };
  }
}
