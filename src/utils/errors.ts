export class StatusError extends Error {
  public status: number;
  constructor(message: string, code: number) {
    super(message);
    this.status = code;
  }
}

/**
 * Basic 400 error
 */
export class Error400 extends StatusError {
  constructor(message: string = 'You do not have permission', code = 400) {
    super(message, code);
  }
}

/**
 * 403 Forbidden errors: The request was valid, but the server is refusing action.
 * The user might not have the necessary permissions for a resource, or may need an account of some sort.
 */
export class Error403 extends StatusError {
  constructor(message: string = 'You do not have permission') {
    super(message, 403);
  }
}

/**
 * 401 Unorthorized: Similar to 403 Forbidden, but specifically for use when authentication
 * is required and has failed or has not yet been provided.
 */
export class Error401 extends StatusError {
  constructor(message: string = 'Authentication Error') {
    super(message, 401);
  }
}

/**
 * 404 Not Found errors: The requested resource could not be
 * found but may be available in the future. Subsequent requests by the client are permissible.
 */
export class Error404 extends StatusError {
  constructor(message: string = 'Could not find resource') {
    super(message, 404);
  }
}

/**
 * 500 Internal Server Error: A generic error message, given when an unexpected condition was
 * encountered and no more specific message is suitable.
 */
export class Error500 extends StatusError {
  constructor(message: string) {
    super(message, 500);
  }
}
