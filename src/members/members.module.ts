import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './schemas/member.schema';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MembersRepository } from './members.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [MembersController],
  providers: [MembersRepository, MembersService],
  exports: [MembersRepository, MembersService],
})
export class MembersModule {}
