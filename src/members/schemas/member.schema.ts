import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
  @Prop({ required: true })
  groupCode: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  nickname: string;

  @Prop() // 마니또 대상자 ID
  manittoId?: string;

  @Prop({ default: [] })
  completedMissions: string[]; // ['day1', 'day2', 'free1'...]

  @Prop()
  predictionManitoId?: string; // 추측 저장

  @Prop()
  predictionUpdatedAt?: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ groupCode: 1, userId: 1 }, { unique: true });
