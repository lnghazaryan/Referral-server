import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class SyncEventsDto {
  @ApiProperty({
    type: [String],
    example: ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
  })
  @IsArray()
  @IsString({ each: true })
  selectedEventIds!: string[];
}
