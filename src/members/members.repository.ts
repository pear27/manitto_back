import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model } from 'mongoose';

@Injectable()
export class MembersRepository {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async create(
    groupCode: string,
    userId: string,
    nickname: string,
  ): Promise<MemberDocument> {
    return new this.memberModel({ groupCode, userId, nickname }).save();
  }

  async findManyByGroup(groupCode: string): Promise<Member[]> {
    return this.memberModel.find({ groupCode }).exec();
  }

  async findOneByGroupAndUser(
    groupCode: string,
    userId: string,
  ): Promise<MemberDocument | null> {
    return await this.memberModel.findOne({ groupCode, userId });
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
