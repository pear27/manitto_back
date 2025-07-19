import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model } from 'mongoose';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly usersRepository: UsersRepository,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async createMember(groupCode: string, userId: string) {
    const user = await this.usersRepository.findOneByKakaoId(userId);

    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }

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
}
