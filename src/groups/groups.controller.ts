import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MembersService } from 'src/members/members.service';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly membersService: MembersService,
  ) {}

  // 그룹 생성하기
  @UseGuards(JwtAuthGuard)
  @Post()
  async createGroup(@Req() req, @Body('name') name: string) {
    const hostId = req.user.userId;
    return await this.groupsService.createGroup(name, hostId);
  }

  // 그룹 정보 가져오기
  @UseGuards(JwtAuthGuard)
  @Get(':groupCode')
  async getGroupInfo(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return await this.groupsService.getGroupInfo(groupCode, userId);
  }

  // 그룹에 참여하기 (로그인한 사용자)
  @UseGuards(JwtAuthGuard)
  @Post(':groupCode/members')
  async joinGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return await this.membersService.createMember(groupCode, userId);
  }

  // 그룹 잠그기 (방장만 가능)
  @UseGuards(JwtAuthGuard)
  @Patch(':inviteCode/lock')
  async lockGroup(@Param('inviteCode') inviteCode: string, @Req() req) {
    const hostId = req.user.userId;
    return await this.groupsService.lockGroup(inviteCode, hostId);
  }

  // 그룹 매칭하기 (방장만 가능)
  @UseGuards(JwtAuthGuard)
  @Post(':groupCode/match')
  async matchGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const hostId = req.user.userId;
    return await this.groupsService.matchManittosInGroup(groupCode, hostId);
  }

  // 그룹 삭제하기 (방장만 가능)
  @UseGuards(JwtAuthGuard)
  @Delete(':inviteCode')
  async deleteGroup(@Param('inviteCode') inviteCode: string, @Req() req) {
    const hostId = req.user.userId;
    return await this.groupsService.deleteGroup(inviteCode, hostId);
  }

  // 그룹에서 나가기 (로그인한 사용자)
  @UseGuards(JwtAuthGuard)
  @Delete(':groupCode/members')
  async leaveGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.userId;
    return await this.membersService.deleteMember(groupCode, userId);
  }
}
