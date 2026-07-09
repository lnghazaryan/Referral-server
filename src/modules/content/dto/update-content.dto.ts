import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class UpdateContentDto {
  @ApiProperty({
    description: "Flat map of landing content keys to their translated strings.",
    example: {
      "hero.title": "Get your personal promo code",
      "hero.subtitle": "A friend invited you to Eventhub."
    }
  })
  @IsObject()
  content!: Record<string, unknown>;
}
