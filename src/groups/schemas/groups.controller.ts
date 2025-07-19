import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGroup(@Req() req, @Body('name') name: string) {
    const hostId = req.user.kakaoId;
    return this.groupsService.createGroup(name, hostId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lock')
  async lockGroup(@Req() req, @Body('inviteCode') inviteCode: string) {
    const hostId = req.user.kakaoId;
    return this.groupsService.lockGroup(inviteCode, hostId);
  }
}
