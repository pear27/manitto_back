import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model } from 'mongoose';
import { UsersRepository } from 'src/users/users.repository';
import { GroupsRepository } from 'src/groups/groups.repository';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly groupsRepository: GroupsRepository,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async createMember(groupCode: string, userId: string) {
    const user = await this.usersRepository.findOneByKakaoId(userId);
    const group = await this.groupsRepository.findByCode(groupCode);

    if (!user || !group) {
      throw new NotFoundException(
        `사용자(${userId}) 또는 그룹(${groupCode})을 찾을 수 없습니다.`,
      );
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

    const member = await this.membersRepository.create(
      groupCode,
      userId,
      user.nickname,
    );

    return {
      message: '✅ 그룹에 새 멤버를 추가했습니다!',
      inviteCode: member.groupCode,
      member: member.nickname,
    };
  }

  async deleteMember(groupCode: string, userId: string) {
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

    return this.membersRepository.findManyByGroup(groupCode);
  }
}
