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

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGroup(@Req() req, @Body('name') name: string) {
    const hostId = req.user.kakaoId;
    return await this.groupsService.createGroup(name, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':groupCode')
  async getGroupInfo(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.kakaoId;
    return await this.groupsService.getGroupInfo(groupCode, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':groupCode/members')
  async joinGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.kakaoId;
    return await this.membersService.createMember(groupCode, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':inviteCode/lock')
  async lockGroup(@Param('inviteCode') inviteCode: string, @Req() req) {
    const hostId = req.user.kakaoId;
    return await this.groupsService.lockGroup(inviteCode, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':inviteCode')
  async deleteGroup(@Param('inviteCode') inviteCode: string, @Req() req) {
    const hostId = req.user.kakaoId;
    return await this.groupsService.deleteGroup(inviteCode, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':groupCode/members')
  async leaveGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.kakaoId;
    return await this.membersService.deleteMember(groupCode, userId);
  }
}
