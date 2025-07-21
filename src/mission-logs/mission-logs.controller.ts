import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MissionLogsService } from './mission-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMissionLogDto } from './dto/create-mission-log.dto';

@Controller('mission-logs')
export class MissionLogsController {
  constructor(private readonly missionLogsService: MissionLogsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':groupCode')
  async createMissionLog(
    @Param('groupCode') groupCode: string,
    @Req() req,
    @Body() createMissionLogDto: CreateMissionLogDto,
  ) {
    const userId = req.user.userId;
    return await this.missionLogsService.createMissionLog(
      groupCode,
      userId,
      createMissionLogDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async markAsCompleted(
    @Req() req,
    @Body('missionLogId') missionLogId: string,
  ) {
    return await this.missionLogsService.markAsCompleted(missionLogId);
  }
}
