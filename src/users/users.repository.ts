import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByKakaoId(kakaoId: string): Promise<User | null> {
    return this.userModel.findOne({ kakaoId });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findOneAndUpdate(
    userFilterQuery: FilterQuery<User>,
    userUpdate: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findOneAndUpdate(userFilterQuery, userUpdate);
  }

  async deleteOneByKakaoId(kakaoId: string): Promise<void> {
    const user = await this.userModel.deleteOne({ kakaoId });

    if (user.deletedCount === 0)
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
  }
}
