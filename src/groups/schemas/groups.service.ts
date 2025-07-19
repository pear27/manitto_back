import { Injectable } from '@nestjs/common';
import { Group, GroupDocument } from './group.schema';
import { GroupsRepository } from './groups.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  // 그룹 생성 함수
  async createGroup(name: string, hostId: string) {
    const inviteCode = await this.generateUniqueInviteCode();
    const group = await this.groupsRepository.create(inviteCode, name, hostId);

    return {
      message: '✅ 그룹 생성 성공!',
      inviteCode: group.inviteCode,
      name: group.name,
    };
  }

  // 그룹 잠금 함수 (더 이상 멤버 초대 불가)
  async lockGroup(inviteCode: string, hostId: string) {
    const group = await this.groupsRepository.findByCode(inviteCode);
    if (!group || group.hostId !== hostId) {
      return { message: '그룹의 호스트만 그룹을 잠글 수 있습니다.' };
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
    if (!group || group.hostId !== hostId)
      return { message: '그룹의 호스트만 그룹을 삭제할 수 있습니다.' };
    await this.groupsRepository.deleteOneByCode(inviteCode);
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
