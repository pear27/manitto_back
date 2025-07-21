import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import { CreateGroupWithHostDto } from './groups.service';

export interface CreateGroupFinalDto extends CreateGroupWithHostDto {
  inviteCode: string;
}

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(dto: CreateGroupFinalDto): Promise<GroupDocument> {
    const plain = { ...dto }; // DTO → 순수 객체
    return await new this.groupModel(plain).save();
  }

  async findByCode(inviteCode: string): Promise<GroupDocument | null> {
    return await this.groupModel
      .findOne({ inviteCode })
      .populate<'hostId'>('hostId', '_id nickname')
      .exec();
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
    const result = await this.groupModel.deleteOne({ inviteCode });
    if (result.deletedCount === 0)
      throw new NotFoundException(
        `해당 그룹(${inviteCode})을 찾을 수 없습니다.`,
      );
  }
}
