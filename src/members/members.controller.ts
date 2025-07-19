import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:groupCode')
  async getMembersOfaGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.kakaoId;
    return this.membersService.getMemberList(groupCode, userId);
  }
}
