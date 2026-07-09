import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException
} from "@nestjs/common";
import { env } from "../../../config/env";
import type { DinnoEmailRequest } from "./mail.types";

@Injectable()
export class DinnoEmailClient {
  async send(payload: DinnoEmailRequest): Promise<void> {
    const url = env.EMAIL_API_URL;
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": env.EMAIL_API_KEY
        },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new ServiceUnavailableException(
        "Email API is unavailable."
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(
        `Email API returned status ${response.status}${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }
  }
}
