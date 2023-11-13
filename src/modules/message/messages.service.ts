import { MessagesRepository } from './messages.repository';
import { Message } from './messages.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesServices {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  findAll(): Promise<Message[]> {
    console.log('toooo');
    return this.messagesRepository.find();
  }
}
