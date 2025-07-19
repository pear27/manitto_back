import { Controller } from '@nestjs/common';
import { MembersService } from './members.services';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}
}
