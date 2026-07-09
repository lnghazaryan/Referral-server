import { ApiProperty } from "@nestjs/swagger";

export class ReferralResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  referralId!: number;

  @ApiProperty({ type: String, example: "owner@example.com" })
  email!: string;

  @ApiProperty({
    type: String,
    example: "+37499123456",
    required: false,
    nullable: true
  })
  phone!: string | null;

  @ApiProperty({ type: String, example: "REF-ABCD-1234" })
  referralCode!: string;

  @ApiProperty({
    type: String,
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    required: false,
    nullable: true
  })
  eventId!: string | null;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: "2026-07-07T09:00:00.000Z"
  })
  createdAt!: Date;
}

export class ReferredResponseDto {
  @ApiProperty({ type: Number, example: 1 })
  referredId!: number;

  @ApiProperty({ type: String, example: "friend@example.com" })
  email!: string;

  @ApiProperty({
    type: String,
    example: "+37477111222",
    required: false,
    nullable: true
  })
  phone!: string | null;

  @ApiProperty({ type: String, example: "REF-ABCD-1234" })
  referralCode!: string;

  @ApiProperty({
    type: String,
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    required: false,
    nullable: true
  })
  eventId!: string | null;

  @ApiProperty({ type: Boolean, example: false })
  hasPayment!: boolean;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: "2026-07-07T09:05:00.000Z"
  })
  createdAt!: Date;
}
