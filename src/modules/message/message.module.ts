import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from './message.getway';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService, MessageGateway],
})
export class MessageModule {}
