const dateTimeSchema = {
  type: "string",
  format: "date-time"
};

export const createEventBodySchema = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      nullable: true
    },
    name: { type: "string", example: "Summer Music Night" },
    date: {
      ...dateTimeSchema,
      nullable: true,
      example: "2026-07-08T19:30:00.000Z"
    },
    venue: {
      type: "string",
      nullable: true,
      example: "Komitas Chamber Music Hall"
    },
    category: { type: "string", nullable: true, example: "Concert" },
    data: { type: "object", nullable: true }
  },
  required: ["name"]
};

export const registerReferralBodySchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", example: "owner@example.com" },
    phone: { type: "string", example: "+37499123456" },
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      description:
        "EventHub event UUID for the purchase. Not validated against admin events."
    }
  },
  required: ["email", "phone", "eventId"]
};

export const joinReferredBodySchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", example: "friend@example.com" },
    phone: { type: "string", nullable: true, example: "+37477111222" },
    referralCode: { type: "string", example: "A3B7CD" }
  },
  required: ["email", "referralCode"]
};

export const createReferredBodySchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", example: "friend@example.com" },
    referralCode: { type: "string", example: "A3B7CD" }
  },
  required: ["email", "referralCode"]
};

export const referredPaymentBodySchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", example: "friend@example.com" },
    referralCode: { type: "string", example: "A3B7CD" },
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      description:
        "EventHub event UUID the referred user purchased. Referrer promo is only generated when this event is in our events list."
    },
    phone: { type: "string", nullable: true, example: "+37477111222" }
  },
  required: ["email", "referralCode", "eventId"]
};

export const updatePromoIsUsedBodySchema = {
  type: "object",
  properties: {
    isUsed: { type: "boolean", example: true }
  },
  required: ["isUsed"]
};

export const updateReferredHasPaymentBodySchema = {
  type: "object",
  properties: {
    hasPayment: { type: "boolean", example: true }
  },
  required: ["hasPayment"]
};

export const createReferralBodySchema = registerReferralBodySchema;

export const apiErrorSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", example: 400 },
    error: { type: "string", example: "Bad Request" },
    message: {
      oneOf: [
        { type: "string", example: "Validation failed" },
        { type: "array", items: { type: "string" } }
      ]
    }
  },
  required: ["statusCode", "error", "message"]
};

export const healthSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "ok" }
  },
  required: ["status"]
};

export const eventSchema = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    },
    name: { type: "string", example: "Summer Music Night" },
    date: {
      ...dateTimeSchema,
      nullable: true,
      example: "2026-07-08T19:30:00.000Z"
    },
    venue: {
      type: "string",
      nullable: true,
      example: "Komitas Chamber Music Hall"
    },
    category: { type: "string", nullable: true, example: "Concert" },
    data: { type: "object", nullable: true }
  },
  required: ["eventId", "name"]
};

export const promoSchema = {
  type: "object",
  properties: {
    id: { type: "number", example: 1 },
    promoId: { type: "number", example: 4001, nullable: true },
    code: { type: "string", example: "WELCOME25" },
    type: { type: "string", example: "percentage" },
    purpose: { type: "string", example: "signup" },
    referredId: { type: "number", example: 1, nullable: true },
    referredEmail: {
      type: "string",
      example: "friend@example.com",
      nullable: true
    },
    referredPhone: {
      type: "string",
      example: "+37477111222",
      nullable: true
    },
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      nullable: true
    },
    isUsed: { type: "boolean", example: false },
    createdAt: { ...dateTimeSchema, example: "2026-01-01T08:00:00.000Z" },
    expiredAt: { ...dateTimeSchema, example: "2026-12-31T23:59:59.000Z" }
  },
  required: [
    "id",
    "code",
    "type",
    "purpose",
    "isUsed",
    "createdAt",
    "expiredAt"
  ]
};

export const referralSchema = {
  type: "object",
  properties: {
    referralId: { type: "number", example: 1 },
    email: { type: "string", example: "owner@example.com" },
    phone: { type: "string", nullable: true, example: "+37499123456" },
    referralCode: { type: "string", example: "A3B7CD" },
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      nullable: true
    },
    createdAt: { ...dateTimeSchema, example: "2026-07-07T09:00:00.000Z" }
  },
  required: ["referralId", "email", "referralCode", "createdAt"]
};

export const referredSchema = {
  type: "object",
  properties: {
    referredId: { type: "number", example: 1 },
    email: { type: "string", example: "friend@example.com" },
    phone: { type: "string", nullable: true, example: "+37477111222" },
    referralCode: { type: "string", example: "A3B7CD" },
    eventId: {
      type: "string",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      nullable: true
    },
    hasPayment: { type: "boolean", example: false },
    referrerId: { type: "number", example: 1 },
    referrerEmail: { type: "string", example: "owner@example.com" },
    referrerPhone: {
      type: "string",
      nullable: true,
      example: "+37499123456"
    },
    createdAt: { ...dateTimeSchema, example: "2026-07-07T09:05:00.000Z" }
  },
  required: [
    "referredId",
    "email",
    "referralCode",
    "hasPayment",
    "referrerId",
    "referrerEmail",
    "createdAt"
  ]
};
