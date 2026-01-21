import { IsDateString, IsEnum } from 'class-validator';
import { ReminderChannel } from '@prisma/client';

export class CreateReminderDto {
  @IsDateString()
  remindAt: string;

  @IsEnum(ReminderChannel)
  channel: ReminderChannel;
}
