import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { InternalApi } from "../../common/decorators/internal-api.decorator";
import {
  apiErrorSchema,
  createReferredBodySchema,
  referredPaymentBodySchema,
  promoSchema,
  referredSchema,
  referralSchema,
  registerReferralBodySchema,
  updatePromoIsUsedBodySchema,
  updateReferredHasPaymentBodySchema
} from "../../common/swagger/schemas";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateReferredDto } from "./dto/create-referred.dto";
import { ReferredPaymentDto } from "./dto/referred-payment.dto";
import { RegisterReferralDto } from "./dto/register-referral.dto";
import { UpdatePromoIsUsedDto } from "./dto/update-promo-is-used.dto";
import { UpdateReferredHasPaymentDto } from "./dto/update-referred-has-payment.dto";
import { ReferralService } from "./referral.service";

@ApiTags("Referral")
@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @ApiOperation({
    summary: "List active events from our DB for the public landing page"
  })
  @ApiOkResponse({
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          eventId: { type: "string", nullable: true },
          name: { type: "string" },
          date: { type: "string", nullable: true },
          venue: { type: "string", nullable: true },
          category: { type: "string", nullable: true },
          eventUrlPath: {
            type: "string",
            nullable: true,
            description:
              "English-slug EventHub path without language prefix (re-sync events to populate)"
          },
          imageUrl: { type: "string", nullable: true }
        }
      }
    }
  })
  @Public()
  @Get("public/events")
  listPublicEvents() {
    return this.referralService.listPublicEvents();
  }

  @InternalApi()
  @ApiOperation({ summary: "Get all referrals" })
  @ApiOkResponse({ schema: { type: "array", items: referralSchema } })
  @Get("referrals")
  listReferrals() {
    return this.referralService.listReferrals();
  }

  @InternalApi()
  @ApiOperation({ summary: "Get referral by referralId" })
  @ApiOkResponse({ schema: referralSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Get("referrals/:referralId")
  getReferralById(@Param("referralId", ParseIntPipe) referralId: number) {
    return this.referralService.getReferralById(referralId);
  }

  @ApiOperation({
    summary:
      "Register referral owner after payment (unique email, one-time only). eventId is the EventHub event the user paid for and is stored for reference only."
  })
  @ApiBody({ schema: registerReferralBodySchema })
  @ApiCreatedResponse({ schema: referralSchema })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @ApiConflictResponse({ schema: apiErrorSchema })
  @Public()
  @Post("referrals")
  registerReferral(@Body() dto: RegisterReferralDto) {
    return this.referralService.registerReferral(dto);
  }

  @InternalApi()
  @ApiOperation({ summary: "Get all referred users" })
  @ApiOkResponse({ schema: { type: "array", items: referredSchema } })
  @Get("referred")
  listReferred() {
    return this.referralService.listReferred();
  }

  @InternalApi()
  @ApiOperation({ summary: "Get referred user by referredId" })
  @ApiOkResponse({ schema: referredSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Get("referred/:referredId")
  getReferredById(@Param("referredId", ParseIntPipe) referredId: number) {
    return this.referralService.getReferredById(referredId);
  }

  @ApiOperation({
    summary:
      "Join as referred user, generate signup promo, and email promo to referred"
  })
  @ApiBody({ schema: createReferredBodySchema })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      properties: {
        referred: referredSchema,
        promo: promoSchema
      }
    }
  })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @ApiConflictResponse({ schema: apiErrorSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Public()
  @Post("referred")
  createReferred(@Body() dto: CreateReferredDto) {
    return this.referralService.createReferred(dto);
  }

  @ApiOperation({
    summary:
      "Mark referred payment complete, generate reward promo, and email referrer"
  })
  @ApiBody({ schema: referredPaymentBodySchema })
  @ApiCreatedResponse({
    schema: {
      type: "object",
      properties: {
        referred: referredSchema,
        promo: promoSchema
      }
    }
  })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @ApiConflictResponse({ schema: apiErrorSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Public()
  @Post("referred/payment")
  completeReferredPayment(@Body() dto: ReferredPaymentDto) {
    return this.referralService.completeReferredPayment(dto);
  }

  @InternalApi()
  @ApiOperation({ summary: "Get all generated promos" })
  @ApiOkResponse({ schema: { type: "array", items: promoSchema } })
  @Get("promos")
  listPromos() {
    return this.referralService.listPromos();
  }

  @InternalApi()
  @ApiOperation({ summary: "Update promo isUsed flag" })
  @ApiBody({ schema: updatePromoIsUsedBodySchema })
  @ApiOkResponse({ schema: promoSchema })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Roles("Admin")
  @Patch("promos/:promoId/is-used")
  updatePromoIsUsed(
    @Param("promoId", ParseIntPipe) promoId: number,
    @Body() dto: UpdatePromoIsUsedDto
  ) {
    return this.referralService.updatePromoIsUsed(promoId, dto.isUsed);
  }

  @InternalApi()
  @ApiOperation({ summary: "Resend the promo email for a promo record" })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @Roles("Admin")
  @Post("promos/:promoId/resend")
  resendPromoEmail(@Param("promoId", ParseIntPipe) promoId: number) {
    return this.referralService.resendPromoEmail(promoId);
  }

  @InternalApi()
  @ApiOperation({ summary: "Update referred hasPayment flag" })
  @ApiBody({ schema: updateReferredHasPaymentBodySchema })
  @ApiCreatedResponse({
    schema: {
      oneOf: [
        referredSchema,
        {
          type: "object",
          properties: {
            referred: referredSchema,
            promo: promoSchema
          }
        }
      ]
    }
  })
  @ApiNotFoundResponse({ schema: apiErrorSchema })
  @Roles("Admin")
  @Patch("referred/:referredId/has-payment")
  updateReferredHasPayment(
    @Param("referredId", ParseIntPipe) referredId: number,
    @Body() dto: UpdateReferredHasPaymentDto
  ) {
    return this.referralService.updateReferredHasPayment(
      referredId,
      dto.hasPayment
    );
  }
}
