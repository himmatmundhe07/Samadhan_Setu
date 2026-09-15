/**
 * Samadhan Setu — API Error
 * Preserves HTTP status / network-failure information so callers can tell an
 * unreachable backend apart from an auth or validation rejection.
 */
export type ApiErrorKind = 'network' | 'auth' | 'server';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export const toApiError = (err: any, fallbackMessage: string): ApiError => {
  if (err instanceof ApiError) return err;

  const status: number | undefined = err?.response?.status;
  const message = err?.response?.data?.message || err?.message || fallbackMessage;

  if (!err?.response) {
    return new ApiError(message, 'network');
  }
  if (status === 401 || status === 403) {
    return new ApiError(message, 'auth', status);
  }
  return new ApiError(message, 'server', status);
};
