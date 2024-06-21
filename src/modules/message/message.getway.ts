import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  @Auth()
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      recipientId: string;
      content: string;
    },
    @CurrentUser() senderId: string,
  ) {
    const { recipientId, content } = data;
    const message = await this.messageService.createMessage(
      senderId,
      recipientId,
      { content },
    );
    this.server.to([senderId, recipientId]).emit('message', message);
    return message;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string) {
    this.server.socketsJoin(roomId);
  }

  afterInit(server: Server) {
    // eslint-disable-next-line no-console
    console.log(server);
  }

  handleConnection(client: Socket) {
    // eslint-disable-next-line no-console
    console.log('Connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // eslint-disable-next-line no-console
    console.log('Connected:', client.id);
  }
}
