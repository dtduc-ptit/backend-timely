import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsDateString()
  startDate: string;

  @IsInt()
  categoryId: number;

  @IsInt()
  targetId: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  reminderDays?: number[]; // [1,7,30]
}
