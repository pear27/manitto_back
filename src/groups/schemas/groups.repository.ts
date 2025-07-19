import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './group.schema';
import { Model } from 'mongoose';

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(
    inviteCode: string,
    name: string,
    hostId: string,
  ): Promise<GroupDocument> {
    return new this.groupModel({ inviteCode, name, hostId }).save();
  }

  async findById(groupId: string): Promise<GroupDocument | null> {
    return await this.groupModel.findById(groupId);
  }

  async findByCode(inviteCode: string): Promise<GroupDocument | null> {
    return await this.groupModel.findOne({ inviteCode });
  }

  async lockGroup(inviteCode: string): Promise<void> {
    await this.groupModel.updateOne({ inviteCode }, { isLocked: true });
  }

  async markAsMatched(inviteCode: string): Promise<void> {
    await this.groupModel.updateOne(
      { inviteCode },
      { isMatched: true, matchedAt: new Date() },
    );
  }

  async setRevealDate(groupId: string, date: Date): Promise<void> {
    await this.groupModel.updateOne({ _id: groupId }, { revealDate: date });
  }

  async deleteOneByCode(inviteCode: string): Promise<void> {
    const group = await this.groupModel.deleteOne({ inviteCode });
    if (group.deletedCount === 0)
      throw new NotFoundException('해당 그룹을 찾을 수 없습니다.');
  }
}
