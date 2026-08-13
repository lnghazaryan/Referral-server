import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException
} from "@nestjs/common";
import { env } from "../../../config/env";

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

type AdminToken = {
  token: string;
  expiration: string;
};

type AdminAuthorizeResponse = {
  accessToken: AdminToken;
  refreshToken: AdminToken;
};

/** Renew slightly before expiry so in-flight requests never use a dead token. */
const TOKEN_EXPIRY_SKEW_MS = 60_000;

@Injectable()
export class EventHubAdminApiClient {
  private cachedToken: { token: string; expiresAtMs: number } | null = null;

  buildUrl(path: string, query?: RequestOptions["query"]): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const baseUrl = env.EVENTHUB_ADMIN_API_BASE_URL.replace(/\/$/, "");
    const url = new URL(`${baseUrl}${normalizedPath}`);

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

  async authorize(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAtMs - TOKEN_EXPIRY_SKEW_MS > now) {
      return this.cachedToken.token;
    }

    const username = env.EVENTHUB_ADMIN_USERNAME;
    const password = env.EVENTHUB_ADMIN_PASSWORD;

    if (!username || !password) {
      throw new ServiceUnavailableException(
        "EventHub Admin API credentials are not configured."
      );
    }

    const response = await this.request<AdminAuthorizeResponse>(
      "POST",
      "/authorization/getToken",
      { username, password },
      { skipAuth: true }
    );

    const token = response?.accessToken?.token;
    if (!token) {
      throw new BadGatewayException(
        "EventHub Admin API /authorization/getToken did not return an access token."
      );
    }

    const expiration = Date.parse(response.accessToken.expiration ?? "");
    this.cachedToken = {
      token,
      expiresAtMs: Number.isNaN(expiration) ? now + 5 * 60_000 : expiration
    };

    return token;
  }

  private async request<T>(
    method: "GET" | "POST",
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
      headers.Authorization = `Bearer ${await this.authorize()}`;
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
        `EventHub Admin API is unavailable for ${path}.`
      );
    }

    if (response.status === 401 && !options.skipAuth) {
      // Cached token was rejected; drop it so the next call re-authorizes.
      this.cachedToken = null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(
        `EventHub Admin API ${path} returned status ${response.status}${
          errorText ? `: ${errorText}` : ""
        }`
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }
}
