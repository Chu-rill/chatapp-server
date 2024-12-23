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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.error('Error in handleConnection:', error);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.chatService.handleDisconnect(client.id);
    this.server.emit('userList', this.chatService.getActiveUsers());
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, username: string): Promise<void> {
    await this.chatService.addUser(client.id, username);
    this.server.emit('userList', this.chatService.getActiveUsers());
  }

  @SubscribeMessage('message2')
  async message2(@MessageBody() message: string): Promise<void> {
    this.server.emit('message2', message);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    data: { sender: string; content: string },
  ): Promise<void> {
    const message = await this.chatService.saveMessage(
      data.sender,
      data.content,
    );
    this.server.emit('message', message);
  }

  @SubscribeMessage('history')
  async handleHistory(client: Socket): Promise<void> {
    const messages = await this.chatService.getChatHistory();
    client.emit('history', messages);
  }
}
