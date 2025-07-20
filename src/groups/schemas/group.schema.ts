import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ required: true, unique: true })
  inviteCode: string; // 초대 코드

  @Prop({ required: true })
  name: string; // 그룹 이름

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  hostId: Types.ObjectId; // 방장 _id

  @Prop({ default: false })
  isLocked: boolean; // 초대 마감

  @Prop({ default: false })
  isMatched: boolean; // 매칭 여부

  @Prop({ type: Date })
  matchedAt?: Date; // 매칭 시작 시간

  @Prop({ type: Date })
  revealDate?: Date; // 마니또 공개 시간
}

export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.index({ inviteCode: 1 });
