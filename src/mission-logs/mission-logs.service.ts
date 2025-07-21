import { ForbiddenException, Injectable } from '@nestjs/common';
import { MissionLogsRepository } from './mission-logs.repository';
import { CreateMissionLogDto } from './dto/create-mission-log.dto';
import { MembersRepository } from 'src/members/members.repository';
import dayjs from 'dayjs';

@Injectable()
export class MissionLogsService {
  constructor(
    private readonly missionLogsRepository: MissionLogsRepository,
    private readonly membersRepository: MembersRepository,
  ) {}

  async createMissionLog(
    groupCode: string,
    userId: string,
    dto: CreateMissionLogDto,
  ) {
    const member = await this.membersRepository.findOneByGroupAndUser(
      groupCode,
      userId,
    );

    if (!member)
      throw new ForbiddenException(
        `그룹(${groupCode})에 해당 멤버가 없거나 해당 그룹이 존재하지 않습니다.`,
      );

    const memberId = member._id.toString();

    const missionLog = await this.missionLogsRepository.create({
      ...dto,
      memberId,
    });

    const missionLogId = missionLog._id.toString();
    await this.membersRepository.addMissionLogToArray(memberId, missionLogId);
  }

  async createDefaultMissions(groupCode) {
    const members = await this.membersRepository.findManyByGroup(groupCode);

    const today = dayjs().format('YYYY-MM-DD');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    for (const member of members) {
      const userId = member.userId._id.toString();
      const dto1 = {
        performedAt: today,
        letterToReceiver: '👼',
        missionContent: '상대를 칭찬하기',
        isCompleted: false,
      };
      const dto2 = {
        performedAt: tomorrow,
        letterToReceiver: '👼',
        missionContent: '함께 식사하기',
        isCompleted: false,
      };

      await this.createMissionLog(groupCode, userId, dto1);
      await this.createMissionLog(groupCode, userId, dto2);
    }
  }

  async markAsCompleted(missionLogId: string) {
    return await this.missionLogsRepository.markAsCompleted(missionLogId);
  }
}
