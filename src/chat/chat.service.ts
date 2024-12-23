import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private connectedUsers = new Map<string, string>(); // Maps socket IDs to usernames

  constructor(private readonly prisma: PrismaService) {}

  // Add a user to the connected list
  async addUser(socketId: string, username: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new Error(`User with username "${username}" does not exist.`);
    }

    this.connectedUsers.set(socketId, username);
  }

  // Handle user disconnection
  async handleDisconnect(socketId: string): Promise<void> {
    this.connectedUsers.delete(socketId);
  }

  // Get the list of active users
  getActiveUsers(): string[] {
    return Array.from(this.connectedUsers.values());
  }

  // Save a message to the database
  async saveMessage(sender: string, content: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: sender },
    });
    if (!user) {
      throw new Error(`User ${sender} not found`);
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId: user.id,
      },
    });

    return {
      id: message.id,
      content: message.content,
      sender,
      createdAt: message.createdAt,
    };
  }

  // Retrieve chat history
  async getChatHistory(): Promise<
    { id: number; content: string; sender: string; createdAt: Date }[]
  > {
    const messages = await this.prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { sender: true },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender.username,
      createdAt: msg.createdAt,
    }));
  }
}
