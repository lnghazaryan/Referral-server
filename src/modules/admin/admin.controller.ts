import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeController,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import {
  apiErrorSchema,
  createEventBodySchema,
  eventSchema,
  promoSchema
} from "../../common/swagger/schemas";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { AdminService } from "./admin.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { SyncEventsDto } from "./dto/sync-events.dto";

@ApiTags("Admin")
@ApiExcludeController()
@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: "Get EventHub catalog with local selection state" })
  @ApiOkResponse({
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          eventId: { type: "string" },
          eventName: { type: "string", nullable: true },
          eventDateTime: { type: "string", nullable: true },
          eventCategory: { type: "string", nullable: true },
          venue: { type: "string", nullable: true },
          imageUrl: { type: "string", nullable: true },
          isSelected: { type: "boolean" }
        }
      }
    }
  })
  @Get("events/catalog")
  listExternalEventsCatalog() {
    return this.adminService.listExternalEventsCatalog();
  }

  @ApiOperation({ summary: "Get all events" })
  @ApiOkResponse({ schema: { type: "array", items: eventSchema } })
  @Get("events")
  listEvents() {
    return this.adminService.listEvents();
  }

  @ApiOperation({ summary: "Get event by eventId" })
  @ApiOkResponse({ schema: eventSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Get("events/:eventId")
  getEventById(@Param("eventId") eventId: string) {
    return this.adminService.getEventById(eventId);
  }

  @ApiOperation({
    summary: "Sync selected EventHub events into local DB with full payload"
  })
  @ApiCreatedResponse({ schema: { type: "array", items: eventSchema } })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Roles("Admin")
  @Post("events/sync")
  syncEvents(@Body() dto: SyncEventsDto) {
    return this.adminService.syncEvents(dto);
  }

  @ApiOperation({ summary: "Create an event" })
  @ApiBody({ schema: createEventBodySchema })
  @ApiCreatedResponse({ schema: eventSchema })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Roles("Admin")
  @Post("events")
  createEvent(@Body() dto: CreateEventDto) {
    return this.adminService.createEvent(dto);
  }

  @ApiOperation({ summary: "Get all promos" })
  @ApiOkResponse({ schema: { type: "array", items: promoSchema } })
  @Get("promos")
  listPromos() {
    return this.adminService.listPromos();
  }

  @ApiOperation({ summary: "Get promo by promoId" })
  @ApiOkResponse({ schema: promoSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Get("promos/:promoId")
  getPromoById(@Param("promoId") promoId: string) {
    return this.adminService.getPromoById(Number(promoId));
  }
}
