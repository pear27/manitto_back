import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ required: true })
  inviteCode: string; // 초대 코드

  @Prop({ required: true })
  name: string; // 그룹 이름

  @Prop({ required: true })
  hostId: string;

  @Prop({ default: false })
  isLocked: boolean; // 초대 마감

  @Prop({ default: false })
  isMatched: boolean;

  @Prop({ type: Date })
  matchedAt?: Date; // 매칭 시작 시간

  @Prop({ type: Date })
  revealDate?: Date; // 마니또 공개 시간
}

export const GroupSchema = SchemaFactory.createForClass(Group);
