import { BadGatewayException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(
    senderId: string,
    recipientId: string,
    dto: CreateMessageDto,
  ) {
    try {
      const room = await this.prisma.room.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  id: senderId,
                },
              },
            },
            {
              participants: {
                some: {
                  id: recipientId,
                },
              },
            },
          ],
        },
      });

      const message = await this.prisma.message.create({
        data: {
          ...dto,
          sender: {
            connect: { id: senderId },
          },
          recipient: {
            connect: { id: recipientId },
          },
          room: {
            connect: {
              id: room.id,
            },
          },
        },
      });

      await this.prisma.room.update({
        where: { id: room.id },
        data: {
          messages: { connect: { id: message.id } },
        },
      });

      return message;
    } catch (error) {
      const e = error as Error;
      throw new BadGatewayException(e.message);
    }
  }

  async createRoom(senderId: string, recipientId: string) {
    try {
      const check = await this.prisma.room.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  id: senderId,
                },
              },
            },
            {
              participants: {
                some: {
                  id: recipientId,
                },
              },
            },
          ],
        },
      });

      if (check) {
        return check;
      }

      const room = await this.prisma.room.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: recipientId }],
          },
          messages: {
            create: [],
          },
        },
      });

      return room;
    } catch (error) {
      const e = error as Error;
      throw new BadGatewayException(e.message);
    }
  }
}
