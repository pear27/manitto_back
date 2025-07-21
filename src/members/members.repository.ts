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
      .exec();
  }

  async updateManyManitto(
    matchingResults: {
      groupCode: string;
      userId: Types.ObjectId;
      manittoId: Types.ObjectId;
    }[],
  ): Promise<void> {
    const bulkOps = matchingResults.map(({ groupCode, userId, manittoId }) => ({
      updateOne: {
        filter: { groupCode, userId },
        update: { manittoId },
      },
    }));
    if (bulkOps.length === 0) return;

    const result = await this.memberModel.bulkWrite(bulkOps);
    console.log(
      `수정 성공: ${result.modifiedCount}건 / 총 ${bulkOps.length}건`,
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
