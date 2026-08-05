import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsISO8601, IsOptional } from "class-validator";

export type AnalyticsGranularity = "daily" | "weekly" | "monthly";

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: ["daily", "weekly", "monthly"],
    default: "daily",
    description: "Bucket size for the time series"
  })
  @IsOptional()
  @IsIn(["daily", "weekly", "monthly"])
  granularity?: AnalyticsGranularity;

  @ApiPropertyOptional({
    example: "2026-01-01",
    description: "Inclusive range start (ISO date or datetime)"
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    example: "2026-08-04",
    description: "Inclusive range end (ISO date or datetime)"
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
