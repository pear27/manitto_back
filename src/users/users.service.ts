import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async updateNicknameByKakaoId(kakaoId: string, nickname: string) {
    const updatedUser = await this.usersRepository.findOneAndUpdate(
      { kakaoId },
      { nickname },
    );

    if (!updatedUser)
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');

    return {
      message: '✅ 닉네임 변경 완료!',
      nickname: updatedUser.nickname,
    };
  }
}
