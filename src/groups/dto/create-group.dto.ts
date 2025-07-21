import { IsDateString, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  revealDate: string;
}
