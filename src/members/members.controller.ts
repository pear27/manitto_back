import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // 그룹에 참여한 멤버 조회하기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode')
  async getMembersOfaGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return this.membersService.getMemberList(groupCode, userId);
  }
}
