import {
  Body,
  Controller,
  Delete,
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
    return this.groupsService.createGroup(name, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':groupCode/members')
  async joinGroup(@Param('groupCode') groupCode: string, @Req() req) {
    const userId = req.user.kakaoId;
    return this.membersService.createMember(groupCode, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lock')
  async lockGroup(@Req() req, @Body('inviteCode') inviteCode: string) {
    const hostId = req.user.kakaoId;
    return this.groupsService.lockGroup(inviteCode, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteGroup(@Req() req, @Body('inviteCode') inviteCode: string) {
    const hostId = req.user.kakaoId;
    return this.groupsService.deleteGroup(inviteCode, hostId);
  }
}
