import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesServices } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessagesRepository])],
  providers: [MessagesServices, MessagesRepository],
  controllers: [MessagesController],
})
export class MessagesModule {}
