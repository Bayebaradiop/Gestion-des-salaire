// Interface pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Interface pour les erreurs API
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: ValidationError[];
  timestamp: string;
  path?: string;
}

// Classe pour les erreurs personnalisées
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ValidationError[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: ValidationError[],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs spécifiques
export class ValidationAppError extends AppError {
  constructor(details: ValidationError[], message: string = 'Erreur de validation des données') {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource non trouvée') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès interdit') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflit de données') {
    super(message, 409, 'CONFLICT');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erreur de connexion à la base de données') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// Erreurs spécifiques au domaine
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

export class EntrepriseError extends AppError {
  constructor(message: string, statusCode: number = 400, code: string = 'ENTREPRISE_ERROR') {
    super(message, statusCode, code);
  }
}

export class EmployeError extends AppError {
  constructor(message: string, statusCode: number = 400, code: string = 'EMPLOYE_ERROR') {
    super(message, statusCode, code);
  }
}

export class CyclePaieError extends AppError {
  constructor(message: string, statusCode: number = 400, code: string = 'CYCLE_PAIE_ERROR') {
    super(message, statusCode, code);
  }
}

export class BulletinPaieError extends AppError {
  constructor(message: string, statusCode: number = 400, code: string = 'BULLETIN_PAIE_ERROR') {
    super(message, statusCode, code);
  }
}

export class PaiementError extends AppError {
  constructor(message: string, statusCode: number = 400, code: string = 'PAIEMENT_ERROR') {
    super(message, statusCode, code);
  }
}

export function createApiError(
  error: AppError,
  path?: string
): ApiError {
  return {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    timestamp: new Date().toISOString(),
    path,
  };
}

// Fonction pour vérifier si une erreur est opérationnelle
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}