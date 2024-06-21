import { Controller, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Auth()
  @Post(':id')
  createRoom(
    @CurrentUser('id') senderId: string,
    @Param('id') recipientId: string,
  ) {
    return this.messageService.createRoom(senderId, recipientId);
  }
}
