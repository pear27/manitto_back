import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MissionLogDocument = MissionLog &
  Document & { _id: Types.ObjectId };

@Schema()
export class MissionLog {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Types.ObjectId; // member 단위 정보 (group의 user로써)

  @Prop({})
  letterToReceiver: string;

  @Prop({ required: true })
  missionContent: string;

  @Prop({ required: true })
  performedAt: Date;

  @Prop({ default: false })
  isNotificationSent: boolean; // true이면 이미 receiver에게 알림이 간 미션. 수정 및 삭제 불가

  @Prop({ default: true })
  isCompleted: boolean;
}

export const MissionLogSchema = SchemaFactory.createForClass(MissionLog);
