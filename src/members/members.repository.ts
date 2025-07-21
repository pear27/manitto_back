import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class MembersRepository {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async create(
    groupId: string,
    groupCode: string,
    userId: string,
  ): Promise<MemberDocument> {
    return new this.memberModel({ groupId, groupCode, userId }).save();
  }

  async findManyByGroup(groupCode: string): Promise<Member[]> {
    return this.memberModel
      .find({ groupCode })
      .populate<'userId'>('userId', '_id nickname')
      .exec();
  }

  async findManyByUser(userId: string): Promise<Member[]> {
    return this.memberModel.find({ userId }).exec();
  }

  async findOneByGroupAndUser(
    groupCode: string,
    userId: string,
  ): Promise<MemberDocument | null> {
    return await this.memberModel
      .findOne({ groupCode, userId })
      .populate<'groupId'>(
        'groupId',
        '_id name description isLocked isMatched revealDate',
      )
      .populate<'userId'>('userId', '_id nickname')
      .populate<'manittoId'>('manittoId', '_id nickname')
      .populate<'completedMissions'>(
        'completedMissions',
        '_id letterToReceiver missionContent performedAt isNotificationSent isCompleted',
      )
      .exec();
  }

  async findOneByGroupAndManitto(
    groupCode: string,
    manittoId: string,
  ): Promise<MemberDocument | null> {
    return await this.memberModel
      .findOne({ groupCode, manittoId })
      .populate<'groupId'>(
        'groupId',
        '_id name description isLocked isMatched revealDate',
      )
      .populate<'userId'>('userId', '_id nickname')
      .populate<'manittoId'>('manittoId', '_id nickname')
      .populate<'completedMissions'>(
        'completedMissions',
        '_id letterToReceiver missionContent performedAt isNotificationSent isCompleted',
      )
      .exec();
  }

  async updateManyManitto(
    matchingResults: {
      groupCode: string;
      userId: string;
      manittoId: string;
    }[],
  ): Promise<void> {
    console.log('matchingResults(매칭 결과):', matchingResults);

    const bulkOps = matchingResults.map(({ groupCode, userId, manittoId }) => ({
      updateOne: {
        filter: { groupCode, userId },
        update: { $set: { manittoId } },
      },
    }));
    if (bulkOps.length === 0) return;
    console.log('bulkWrite ops:', bulkOps);

    const result = await this.memberModel.bulkWrite(bulkOps);
    console.log('bulkWrite result:', result);

    console.log(
      `수정 성공: ${result.modifiedCount}건 / 총 ${bulkOps.length}건`,
    );
  }

  // 새로운 미션 로그 ID를 Member에 추가하기
  async addMissionLogToArray(
    memberId: string,
    missionLogId: string,
  ): Promise<void> {
    const result = await this.memberModel.updateOne(
      { _id: new Types.ObjectId(memberId) },
      {
        $addToSet: {
          completedMissions: new Types.ObjectId(missionLogId), // 중복 없이 배열에 추가
        },
      },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        `Member(${memberId})를 찾을 수 없거나 이미 missionLogId가 포함되어 있습니다.`,
      );
    }
  }

  // 나의 마니또 누구인지 맞춰보기
  async updatePredictionManitto(
    groupCode: string,
    userId: string,
    predictionManitto: string,
  ): Promise<void> {
    await this.memberModel.updateOne(
      { groupCode, userId },
      { $set: { predictionManitto } }, // null이어도 덮어쓰기
    );
  }

  async deleteOne(groupCode: string, userId: string): Promise<void> {
    const result = await this.memberModel.deleteOne({ groupCode, userId });
    if (result.deletedCount === 0)
      throw new NotFoundException(
        `그룹 코드(${groupCode})에 해당하는 사용자(${userId})를 찾을 수 없습니다.`,
      );
  }

  async deleteManyByGroup(groupCode: string): Promise<void> {
    const result = await this.memberModel.deleteMany({ groupCode });
    if (result.deletedCount === 0)
      throw new NotFoundException(
        `그룹 코드(${groupCode})에 해당하는 사용자를 찾을 수 없습니다.`,
      );
  }
}
