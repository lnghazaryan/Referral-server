import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdatePromoIsUsedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isUsed!: boolean;
}
