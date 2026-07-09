import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateReferredHasPaymentDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  hasPayment!: boolean;
}
