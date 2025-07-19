import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Req,
  Delete,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('nickname')
  async getNickname(@Req() req) {
    const kakaoId = req.user.kakaoId;
    return await this.usersService.getNicknameByKakaoId(kakaoId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('nickname')
  async updateNickname(@Req() req, @Body('nickname') nickname: string) {
    const kakaoId = req.user.kakaoId;
    return this.usersService.updateNicknameByKakaoId(kakaoId, nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@Req() req) {
    const kakaoId = req.user.kakaoId;
    await this.usersService.deleteUser(kakaoId);
    return { message: '✅ 사용자 삭제가 완료되었습니다.' };
  }
}
