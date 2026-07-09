import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException
} from "@nestjs/common";
import { env } from "../../../config/env";
import { getEventHubBaseUrl, getEventHubEndpointPath } from "./eventhub.config";

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
};

@Injectable()
export class EventHubApiClient {
  buildUrl(path: string, query?: RequestOptions["query"]): string {
    const normalizedPath = getEventHubEndpointPath(path, path);
    const url = new URL(`${getEventHubBaseUrl()}${normalizedPath}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(
    path: string,
    body: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body: unknown,
    options: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Language": env.EVENTHUB_DEFAULT_LANGUAGE,
      ...options.headers
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new ServiceUnavailableException(
        `EventHub API is unavailable for ${path}.`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(
        `EventHub API ${path} returned status ${response.status}${
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

    return (await response.json()) as T;
  }
}
