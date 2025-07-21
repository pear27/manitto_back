import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // 특정 그룹의 내 정보 조회하기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode/myInfo')
  async getMyMemberInfo(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return this.membersService.getMyMemberInfo(groupCode, userId);
  }

  // 그룹에 참여한 멤버 (모두) 조회하기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode')
  async getMembersOfaGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return this.membersService.getMemberList(groupCode, userId);
  }
}
