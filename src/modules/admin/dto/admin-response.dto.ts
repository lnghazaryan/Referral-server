import { ApiProperty } from "@nestjs/swagger";

export class EventResponseDto {
  @ApiProperty({
    type: String,
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  })
  eventId!: string;

  @ApiProperty({ type: String, example: "Summer Music Night" })
  name!: string;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: "2026-07-08T19:30:00.000Z",
    required: false,
    nullable: true
  })
  date!: Date | null;

  @ApiProperty({
    type: String,
    example: "Komitas Chamber Music Hall",
    required: false,
    nullable: true
  })
  venue!: string | null;

  @ApiProperty({
    type: String,
    example: "Concert",
    required: false,
    nullable: true
  })
  category!: string | null;

  @ApiProperty({ required: false, nullable: true })
  data!: Record<string, unknown> | null;
}

export class PromoResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  promoId!: number;

  @ApiProperty({ type: String, example: "WELCOME25" })
  code!: string;

  @ApiProperty({ type: String, example: "percentage" })
  type!: string;

  @ApiProperty({ type: String, example: "signup" })
  purpose!: string;

  @ApiProperty({ type: String, format: "date-time", example: "2026-01-01T08:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ type: String, format: "date-time", example: "2026-12-31T23:59:59.000Z" })
  expiredAt!: Date;
}
