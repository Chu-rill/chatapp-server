import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private activeUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = client.handshake.query.userId as string; // Pass `userId` in handshake
    this.activeUsers.set(userId, client.id);
    this.logger.log(`User connected: ${userId} (Socket: ${client.id})`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = [...this.activeUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) this.activeUsers.delete(userId);
    this.logger.log(`User disconnected: ${userId}`);
  }

  getSocketIdByUserId(userId: string): string | undefined {
    return this.activeUsers.get(userId);
  }

  // @SubscribeMessage('join')
  // async handleJoin(client: Socket, username: string): Promise<void> {
  //   await this.chatService.addUser(client.id, username);
  //   this.server.emit('userList', this.chatService.getActiveUsers());
  // }

  // @SubscribeMessage('message2')
  // async message2(@MessageBody() message: string): Promise<void> {
  //   this.server.emit('message2', message);
  // }

  // @SubscribeMessage('message')
  // async handleMessage(
  //   client: Socket,
  //   data: { sender: string; content: string },
  // ): Promise<void> {
  //   const message = await this.chatService.saveMessage(
  //     data.sender,
  //     data.content,
  //   );
  //   this.server.emit('message', message);
  // }

  // @SubscribeMessage('history')
  // async handleHistory(client: Socket): Promise<void> {
  //   const messages = await this.chatService.getChatHistory();
  //   client.emit('history', messages);
  // }
}
