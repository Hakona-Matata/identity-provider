import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateMessageDto, UpdateMessageDto, GetAllMessagesDto } from './dtos';
import { MessagesServices } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesServices: MessagesServices) {}

  @Post()
  async createMessage(@Body() body: CreateMessageDto) {
    // await this.messagesServices.create();
    console.log({ body });
    return 'created';
  }

  @Put(':messageId')
  async updateMessage(
    @Param() messageId: string,
    @Body() payload: UpdateMessageDto,
  ) {
    console.log({ messageId, payload });
    return 'updated';
  }

  @Delete(':messageId')
  async deleteMessage(@Param() messageId: string) {
    console.log({ messageId });
    return 'deleted';
  }

  @Get('/:messageId')
  async getMessage(@Param('messageId') messageId: number) {
    console.log({ messageId });
    return 'found one';
  }

  @Get()
  async getAllMessages(@Query() query: GetAllMessagesDto) {
    await this.messagesServices.findAll();

    console.log({ query });
    return 'found many';
  }
}
