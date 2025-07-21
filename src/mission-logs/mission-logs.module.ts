import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MissionLog, MissionLogSchema } from './schemas/mission-log.schema';
import { MembersModule } from 'src/members/members.module';
import { MissionLogsController } from './mission-logs.controller';
import { MissionLogsRepository } from './mission-logs.repository';
import { MissionLogsService } from './mission-logs.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MissionLog.name, schema: MissionLogSchema },
    ]),
    MembersModule,
  ],
  controllers: [MissionLogsController],
  providers: [MissionLogsRepository, MissionLogsService],
  exports: [MissionLogsRepository, MissionLogsService],
})
export class MissionLogModule {}
