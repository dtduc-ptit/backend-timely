import {
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  reminderDays?: number[]; // [1,7,30]
}
