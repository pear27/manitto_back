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

  // 로그인한 사용자의 닉네임 가져오기
  @UseGuards(JwtAuthGuard)
  @Get('nickname')
  async getNickname(@Req() req) {
    const userId = req.user.userId;
    return await this.usersService.getNickname(userId);
  }

  // 로그인한 사용자의 닉네임 변경
  @UseGuards(JwtAuthGuard)
  @Patch('nickname')
  async updateNickname(@Req() req, @Body('nickname') nickname: string) {
    const userId = req.user.userId;
    return this.usersService.updateNickname(userId, nickname);
  }

  // 로그인한 사용자 회원 탈퇴
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@Req() req) {
    const userId = req.user.userId;
    await this.usersService.deleteUser(userId);
    return { message: '✅ 사용자 삭제가 완료되었습니다.' };
  }
}
