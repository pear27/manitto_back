import { Injectable } from '@nestjs/common';
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

  async findOneByGroupAndUser(
    groupCode: string,
    userId: string,
  ): Promise<MemberDocument | null> {
    return this.memberModel.findOne({ groupCode, userId });
  }
}
