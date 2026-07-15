import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException
} from "@nestjs/common";
import { env } from "../../../config/env";
import { getPromoApiBaseUrl } from "./promo.config";

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

type PartnerToken = {
  token: string;
  expiration: string;
};

type PartnerAuthorizeResponse = {
  accessToken: PartnerToken;
  refreshToken: PartnerToken;
};

@Injectable()
export class PromoApiClient {
  buildUrl(path: string, query?: RequestOptions["query"]): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${getPromoApiBaseUrl()}${normalizedPath}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(
    path: string,
    body: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  /** Authorize as partner before each authenticated Promo API call. */
  async authorize(): Promise<string> {
    const username = env.EVENTHUB_ORGANIZER_USERNAME;
    const password = env.EVENTHUB_ORGANIZER_PASSWORD;

    if (!username || !password) {
      throw new ServiceUnavailableException(
        "Organizer Promo API credentials are not configured."
      );
    }

    const response = await this.request<PartnerAuthorizeResponse>(
      "POST",
      "/partner/authorize",
      { username, password },
      { skipAuth: true }
    );

    const token = response?.accessToken?.token;
    if (!token) {
      throw new BadGatewayException(
        "Promo API /partner/authorize did not return an access token."
      );
    }

    return token;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT",
    path: string,
    body: unknown,
    options: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    };

    if (!options.skipAuth) {
      const accessToken = await this.authorize();
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new ServiceUnavailableException(
        `Promo API is unavailable for ${path}.`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(
        `Promo API ${path} returned status ${response.status}${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }
}
