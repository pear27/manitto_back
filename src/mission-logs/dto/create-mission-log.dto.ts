import { IsDateString, IsString } from 'class-validator';

export class CreateMissionLogDto {
  // 미션 수행 날짜
  @IsDateString()
  performedAt: string;

  // 마니또에게 보내는 편지
  @IsString()
  letterToReceiver: string;

  // 미션 내용
  @IsString()
  missionContent: String;
}
