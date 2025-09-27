import { Request, Response, NextFunction } from 'express';
import { AppError, createApiError, isOperationalError } from '../validator/errors/index.js';

/**
 * Middleware global de gestion des erreurs Express
 * Ce middleware doit être placé en dernier dans la chaîne des middlewares
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log de l'erreur pour le debugging
  console.error('🚨 Error caught by global handler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
  });

  // Si c'est une erreur opérationnelle (AppError), l'utiliser directement
  if (error instanceof AppError) {
    const apiError = createApiError(error, req.path);
    res.status(error.statusCode).json(apiError);
    return;
  }

  // Gestion des erreurs spécifiques de Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    const appError = handlePrismaError(prismaError);
    const apiError = createApiError(appError, req.path);
    res.status(appError.statusCode).json(apiError);
    return;
  }

  // Gestion des erreurs de validation JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const appError = new AppError(
      'Token invalide',
      401,
      'TOKEN_INVALID'
    );
    const apiError = createApiError(appError, req.path);
    res.status(401).json(apiError);
    return;
  }

  // Gestion des erreurs de syntaxe JSON
  if (error instanceof SyntaxError && 'body' in error) {
    const appError = new AppError(
      'Format JSON invalide dans le corps de la requête',
      400,
      'INVALID_JSON'
    );
    const apiError = createApiError(appError, req.path);
    res.status(400).json(apiError);
    return;
  }

  // Pour toutes les autres erreurs non opérationnelles
  const appError = new AppError(
    process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : error.message,
    500,
    'INTERNAL_ERROR',
    undefined,
    false
  );

  const apiError = createApiError(appError, req.path);
  res.status(500).json(apiError);
}

/**
 * Gestionnaire spécifique pour les erreurs Prisma
 */
function handlePrismaError(error: any): AppError {
  const code = error.code;
  
  switch (code) {
    case 'P2002':
      // Violation de contrainte unique
      const fields = error.meta?.target || ['champ'];
      return new AppError(
        `Une entrée avec ${fields.join(', ')} existe déjà`,
        409,
        'DUPLICATE_ENTRY'
      );
      
    case 'P2014':
      // Violation de relation
      return new AppError(
        'Violation de clé étrangère',
        400,
        'FOREIGN_KEY_VIOLATION'
      );

    case 'P2003':
      // Violation de clé étrangère
      return new AppError(
        'Violation de clé étrangère',
        400,
        'FOREIGN_KEY_VIOLATION'
      );
      
    case 'P2025':
      // Enregistrement non trouvé
      return new AppError(
        'Enregistrement non trouvé',
        404,
        'RECORD_NOT_FOUND'
      );
      
    case 'P2016':
      // Erreur de requête
      return new AppError(
        'Échec de la requête',
        400,
        'QUERY_FAILED'
      );

    default:
      return new AppError(
        'Échec de la requête',
        500,
        'DATABASE_ERROR'
      );
  }
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const appError = new AppError(
    `Route ${req.method} ${req.path} non trouvée`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  const apiError = createApiError(appError, req.path);
  res.status(404).json(apiError);
}

/**
 * Wrapper pour les fonctions async dans les routes
 * Évite d'avoir à écrire try/catch dans chaque route async
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware de validation pour vérifier que la requête contient un token valide
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    const appError = new AppError(
      'Accès refusé',
      401,
      'NO_TOKEN'
    );
    const apiError = createApiError(appError, req.path);
    res.status(401).json(apiError);
    return;
  }

  next();
}

/**
 * Middleware pour logger les requêtes en mode développement
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 ${req.method} ${req.path}`, {
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
  next();
}

/**
 * Middleware pour ajouter des headers de sécurité
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Headers de sécurité de base
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP de base
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  
  next();
}