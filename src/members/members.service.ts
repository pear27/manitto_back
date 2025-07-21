import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model, Types } from 'mongoose';
import { UsersRepository } from 'src/users/users.repository';
import { GroupsRepository } from 'src/groups/groups.repository';
import { assignManitto } from 'src/common/utils/assignManitto';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly groupsRepository: GroupsRepository,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async createMember(groupCode: string, userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    const group = await this.groupsRepository.findByCode(groupCode);

    if (!group) {
      throw new NotFoundException(`그룹(${groupCode})을 찾을 수 없습니다.`);
    }

    if (!user) {
      throw new NotFoundException(`사용자(${userId})를 찾을 수 없습니다.`);
    }

    if (group.isLocked)
      throw new ForbiddenException(
        `해당 그룹(${groupCode})은 초대 마감되었습니다.`,
      );

    const isExisting = await this.membersRepository.findOneByGroupAndUser(
      groupCode,
      userId,
    );
    if (isExisting) {
      throw new ConflictException('이미 해당 그룹에 참가한 사용자입니다.');
    }

    const groupId = group._id.toString();

    const member = await this.membersRepository.create(
      groupId,
      groupCode,
      userId,
    );

    return {
      message: '✅ 그룹에 새 멤버를 추가했습니다!',
      inviteCode: member.groupCode,
      member: member.userId,
    };
  }

  async getMyMemberInfo(groupCode: string, userId: string) {
    const member = await this.membersRepository.findOneByGroupAndUser(
      groupCode,
      userId,
    );

    if (!member)
      throw new ForbiddenException(
        `그룹(${groupCode})에 해당 멤버가 없습니다.`,
      );

    return member;
  }

  async deleteMember(groupCode: string, userId: string) {
    const group = await this.groupsRepository.findByCode(groupCode);

    if (!group)
      throw new NotFoundException(
        `해당 그룹(${groupCode})을 찾을 수 없습니다.`,
      );
    else if (group.hostId._id.toString() === userId)
      throw new ForbiddenException(`방장은 그룹을 떠날 수 없습니다.`);

    await this.membersRepository.deleteOne(groupCode, userId);
  }

  async getMemberList(groupCode: string, userId: string) {
    const member = await this.membersRepository.findOneByGroupAndUser(
      groupCode,
      userId,
    );

    if (!member)
      throw new ForbiddenException(
        `그룹(${groupCode})에 해당하는 사용자만 멤버를 열람할 수 있습니다.`,
      );

    return await this.membersRepository.findManyByGroup(groupCode);
  }

  async applyManittoMatching(
    groupCode: string,
  ): Promise<{ success: boolean; message?: string }> {
    const members = await this.membersRepository.findManyByGroup(groupCode);

    const plainMembers = members.map((m) => ({
      groupCode: m.groupCode,
      userId: m.userId._id.toString(),
    }));

    const matchResults = assignManitto(plainMembers);
    if (!matchResults) {
      return {
        success: false,
        message: '유효한 매칭 결과를 생성하지 못했습니다.',
      };
    }

    const resultsWithObjectId = matchResults.map((match) => ({
      groupCode: match.groupCode,
      userId: new Types.ObjectId(match.userId),
      manittoId: new Types.ObjectId(match.manittoId),
    }));

    await this.membersRepository.updateManyManitto(matchResults);
    return { success: true };
  }

  async guessMyManitto(
    groupCode: string,
    userId: string,
    predictionManitto: string,
  ) {
    await this.membersRepository.updatePredictionManitto(
      groupCode,
      userId,
      predictionManitto,
    );
  }
  async getMyManittoInfo(groupCode: string, userId: string) {
    const manittoId = userId;
    const member = await this.membersRepository.findOneByGroupAndManitto(
      groupCode,
      manittoId,
    );

    if (!member)
      throw new ForbiddenException(
        `그룹(${groupCode})에 해당 멤버가 없습니다.`,
      );

    return member;
  }
}
