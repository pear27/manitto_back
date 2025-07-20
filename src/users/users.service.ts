import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getNickname(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    return { nickname: user?.nickname };
  }

  async updateNickname(userId: string, nickname: string) {
    const updatedUser = await this.usersRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      { nickname },
    );

    if (!updatedUser)
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');

    return {
      message: '✅ 닉네임 변경 완료!',
      nickname: updatedUser.nickname,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await this.usersRepository.deleteOneById(userId);
  }
}
