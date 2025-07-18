import { Body, Controller, Patch, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('nickname')
  async updateNickname(@Req() req, @Body('nickname') nickname: string) {
    const kakaoId = req.user.kakaoId;
    return this.usersService.updateNicknameByKakaoId(kakaoId, nickname);
  }
}
