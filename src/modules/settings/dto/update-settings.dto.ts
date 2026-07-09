import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";

class PromoSettingsDto {
  @ApiPropertyOptional({ example: "Percent" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  discountType?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCount?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  validityDays?: number;
}

class MailingSettingsDto {
  @ApiPropertyOptional({ example: "ticket@eventhub.am" })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiPropertyOptional({ example: "admin@eventhub.am" })
  @IsOptional()
  @IsEmail()
  bcc?: string;

  @ApiPropertyOptional({ example: "Eventhub" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  displayName?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PromoSettingsDto)
  promo?: PromoSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => MailingSettingsDto)
  mailing?: MailingSettingsDto;
}
