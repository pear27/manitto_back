import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  // 내 마니또 맞춰보기
  @UseGuards(JwtAuthGuard)
  @Post(':groupCode/guess')
  async guessMyManitto(
    @Param('groupCode') groupCode: string,
    @Req() req,
    @Body('predictionManitto') predictionManitto: string,
  ) {
    const userId = req.user.userId;
    return this.membersService.guessMyManitto(
      groupCode,
      userId,
      predictionManitto,
    );
  }

  // 내 마니또 조회하기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode/manitto')
  async getMyManittoInfo(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return this.membersService.getMyManittoInfo(groupCode, userId);
  }

  // 그룹에 참여한 멤버 (모두) 조회하기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode')
  async getMembersOfaGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return this.membersService.getMemberList(groupCode, userId);
  }
}
