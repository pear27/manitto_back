import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';
import { MembersModule } from 'src/members/members.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    MembersModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsRepository, GroupsService],
  exports: [GroupsRepository, GroupsService],
})
export class GroupsModule {}
