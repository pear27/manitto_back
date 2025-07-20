import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
  @Prop({ required: true })
  groupCode: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // 마니또 대상자 ID
  manittoId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], ref: 'MissionLog' })
  completedMissions: Types.ObjectId[]; // ['day1', 'day2', 'free1'...]

  @Prop({ type: Types.ObjectId, ref: 'User' })
  predictionManitoId?: Types.ObjectId; // 추측 저장

  @Prop()
  predictionUpdatedAt?: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ groupCode: 1, userId: 1 }, { unique: true });
