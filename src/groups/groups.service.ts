import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Group, GroupDocument } from './schemas/group.schema';
import { GroupsRepository } from './groups.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Date, Model } from 'mongoose';
import { MembersService } from 'src/members/members.service';
import { MembersRepository } from 'src/members/members.repository';
import { CreateGroupDto } from './dto/create-group.dto';

export interface CreateGroupWithHostDto extends CreateGroupDto {
  hostId: string;
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly membersService: MembersService,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  // 그룹 생성 함수
  async createGroup(dto: CreateGroupWithHostDto) {
    const inviteCode = await this.generateUniqueInviteCode();
    const group = await this.groupsRepository.create({
      ...dto,
      inviteCode,
    });

    // 방장도 해당 그룹의 멤버로 추가
    await this.membersService.createMember(inviteCode, dto.hostId);

    return {
      message: '✅ 그룹 생성 성공!',
      inviteCode: group.inviteCode,
      name: group.name,
    };
  }

  // 내가 참여한 그룹 리스트 가져오기
  async getMyGroupList(userId: string) {
    const myMembers = await this.membersRepository.findManyByUser(userId);
    if (myMembers.length === 0)
      throw new NotFoundException(
        '해당 사용자가 참여하고 있는 그룹이 없습니다.',
      );

    const groupCodes = myMembers.map((member) => member.groupCode);

    const groupPromises = groupCodes.map((code) =>
      this.groupsRepository.findByCode(code),
    );
    const groups = await Promise.all(groupPromises);

    // null 필터링 (유효하지 않은 groupCode가 있을 경우)
    return groups.filter((group) => group !== null);
  }

  // 특정 그룹의 정보 가져오기
  async getGroupInfo(inviteCode: string, userId: string) {
    const group = await this.groupsRepository.findByCode(inviteCode);
    if (!group)
      throw new NotFoundException(
        `그룹 코드(${inviteCode})에 해당하는 그룹을 찾을 수 없습니다.`,
      );

    const user = await this.membersRepository.findOneByGroupAndUser(
      inviteCode,
      userId,
    );

    console.log(user);
    if (!user)
      throw new NotFoundException(
        `해당 그룹(${inviteCode})의 정보에 대한 열람 권한이 없습니다.`,
      );
    return group;
  }

  // 그룹 잠금 함수 (더 이상 멤버 초대 불가)
  async lockGroup(inviteCode: string, hostId: string) {
    const group = await this.groupsRepository.findByCode(inviteCode);

    if (!group)
      throw new NotFoundException(
        `해당 그룹(${inviteCode}을 찾을 수 없습니다.`,
      );
    else if (group.hostId._id.toString() !== hostId) {
      throw new ForbiddenException('그룹의 방장만 그룹을 잠글 수 있습니다.');
    }

    await this.groupsRepository.lockGroup(inviteCode);
    return {
      message: '✅ 그룹 잠금 완료! 이제 멤버를 초대할 수 없습니다.',
      inviteCode: group.inviteCode,
      name: group.name,
    };
  }

  // 그룹 삭제 함수
  async deleteGroup(inviteCode: string, hostId: string) {
    const group = await this.groupsRepository.findByCode(inviteCode);

    if (!group)
      throw new NotFoundException(
        `해당 그룹(${inviteCode}을 찾을 수 없습니다.`,
      );
    else if (group.hostId._id.toString() !== hostId)
      throw new ForbiddenException('그룹의 방장만 그룹을 삭제할 수 있습니다.');

    await this.membersRepository.deleteManyByGroup(inviteCode);
    await this.groupsRepository.deleteOneByCode(inviteCode);
  }

  // 마니또 매칭 함수
  async matchManittosInGroup(groupCode: string, hostId: string) {
    const group = await this.groupsRepository.findByCode(groupCode);

    if (!group)
      throw new NotFoundException(
        `해당 그룹(${groupCode})을 찾을 수 없습니다.`,
      );
    else if (group.hostId._id.toString() !== hostId)
      throw new ForbiddenException(
        '그룹의 방장만 마니또 매칭을 시작할 수 있습니다.',
      );

    if (!group.isLocked || group.isMatched)
      throw new Error('그룹 초대를 잠금하지 않았거나 이미 매칭된 그룹입니다.');

    await this.membersService.applyManittoMatching(groupCode);
    await this.groupsRepository.markAsMatched(groupCode);

    const revealDate = dayjs()
      .add(7, 'day')
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    await this.groupsRepository.setRevealDate(groupCode, revealDate);

    return {
      message: '✅ 그룹 매칭 완료! 즐거운 마니또 주간 되세요!',
      inviteCode: group.inviteCode,
      name: group.name,
    };
  }

  // 고유한 초대코드 생성 함수
  private async generateUniqueInviteCode(): Promise<string> {
    let code: string;
    let exists = true;

    do {
      code = this.generateRandomCode(6); // 예: 'AB12CD'
      const existing = await this.groupsRepository.findByCode(code);
      exists = !!existing;
    } while (exists);

    return code;
  }

  // 랜덤 문자열 생성 (알파벳 + 숫자 조합)
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
