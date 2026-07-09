import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from "class-validator";

export class CreateEventDto {
  @ApiProperty({
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    required: false
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiProperty({ example: "Summer Music Night" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "Komitas Chamber Music Hall", required: false })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty({ example: "Concert", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: "2026-07-08T19:30:00.000Z",
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  data?: Record<string, unknown>;
}
