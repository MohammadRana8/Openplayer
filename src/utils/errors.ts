export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    // Only available on V8/Hermes; harmless to skip elsewhere.
    const capture = (Error as { captureStackTrace?: (target: object, ctor: unknown) => void }).captureStackTrace;
    capture?.(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public readonly query?: string) {
    super(message, 'DATABASE_ERROR', 500, true);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', 400, true);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: number | string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND',
      404,
      true
    );
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'CONFLICT', 409, true);
    this.name = 'ConflictError';
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED', 403, true);
    this.name = 'PermissionDeniedError';
  }
}

export class PlaybackError extends AppError {
  constructor(message: string, public readonly songId?: number) {
    super(message, 'PLAYBACK_ERROR', 500, true);
    this.name = 'PlaybackError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, public readonly path?: string) {
    super(message, 'STORAGE_ERROR', 500, true);
    this.name = 'StorageError';
  }
}

export class BackupError extends AppError {
  constructor(message: string, public readonly operation?: 'create' | 'restore') {
    super(message, 'BACKUP_ERROR', 500, true);
    this.name = 'BackupError';
  }
}

export function handleError(error: unknown, context?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('UNIQUE constraint')) {
      return new ConflictError(error.message);
    }
    if (error.message.includes('FOREIGN KEY constraint')) {
      return new DatabaseError(`Foreign key violation in ${context || 'database operation'}: ${error.message}`);
    }
    if (error.message.includes('no such table')) {
      return new DatabaseError(`Database not initialized: ${error.message}`);
    }
    return new AppError(
      context ? `${context}: ${error.message}` : error.message,
      'UNKNOWN_ERROR',
      500,
      true
    );
  }
  
  return new AppError(
    context ? `${context}: Unknown error` : 'Unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    true
  );
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleError(error, context);
    console.error(`[${context}]`, appError);
    throw appError;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
}

export function toErrorResponse(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }
  
  const appError = handleError(error);
  return {
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
    },
  };
}