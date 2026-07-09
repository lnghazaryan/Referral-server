const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidGuid(value: string | null | undefined): value is string {
  return Boolean(value && GUID_PATTERN.test(value));
}

export function filterValidGuids(values: string[]): string[] {
  return values.filter(isValidGuid);
}
