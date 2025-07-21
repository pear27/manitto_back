import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MissionLog, MissionLogDocument } from './schemas/mission-log.schema';
import { Model } from 'mongoose';
import { CreateMissionLogDto } from './dto/create-mission-log.dto';

export interface CreateMissionLogFinalDto extends CreateMissionLogDto {
  memberId: string;
}

@Injectable()
export class MissionLogsRepository {
  constructor(
    @InjectModel(MissionLog.name)
    private missonLogModel: Model<MissionLogDocument>,
  ) {}

  async create(dto: CreateMissionLogFinalDto): Promise<MissionLogDocument> {
    const plain = { ...dto }; // DTO → 순수 객체
    return await new this.missonLogModel(plain).save();
  }
}
