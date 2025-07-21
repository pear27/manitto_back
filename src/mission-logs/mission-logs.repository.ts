import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MissionLog, MissionLogDocument } from './schemas/mission-log.schema';
import { Model, Types } from 'mongoose';
import { CreateMissionLogDto } from './dto/create-mission-log.dto';

export interface CreateMissionLogFinalDto extends CreateMissionLogDto {
  memberId: string;
}

@Injectable()
export class MissionLogsRepository {
  constructor(
    @InjectModel(MissionLog.name)
    private missionLogModel: Model<MissionLogDocument>,
  ) {}

  async create(dto: CreateMissionLogFinalDto): Promise<MissionLogDocument> {
    const plain = { ...dto }; // DTO → 순수 객체
    return await new this.missionLogModel(plain).save();
  }

  async markAsCompleted(missionLogId: string) {
    const updated = await this.missionLogModel.findOneAndUpdate(
      { _id: new Types.ObjectId(missionLogId) },
      { isCompleted: true },
      { new: true },
    );
    if (!updated)
      throw new NotFoundException(
        `미션 로그(${missionLogId})를 찾을 수 없습니다.`,
      );
    return updated;
  }
}
