import { IsOptional } from 'class-validator';

export class CreateMessageDto {
  ReciverId: string;
  SenderId: string;
  MessageText: string;
}
