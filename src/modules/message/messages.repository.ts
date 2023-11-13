import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {
    super(
      messageRepository.target,
      messageRepository.manager,
      messageRepository.queryRunner,
    );
  }
  // async findAll() {
  //   console.log('here!');
  //   return await super.find({});
  // }
}
