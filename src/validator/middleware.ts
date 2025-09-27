import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod';
import { ValidationAppError, ValidationError } from './errors/index.js';

// Types pour les différentes parties de la requête à valider
export type ValidationTarget = 'body' | 'query' | 'params';

// Interface pour définir les schémas de validation
export interface ValidationSchemas {
  body?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
}

/**
 * Middleware de validation générique utilisant Zod
 * @param schemas - Schémas de validation pour body, query et/ou params
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    // Validation du body
    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'body'));
        }
      }
    }

    // Validation des query parameters
    if (schemas.query) {
      try {
        req.query = schemas.query.parse(req.query);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'query'));
        }
      }
    }

    // Validation des params
    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'params'));
        }
      }
    }

    // Si des erreurs sont trouvées, lancer une exception
    if (errors.length > 0) {
      throw new ValidationAppError(errors);
    }

    next();
  };
}

/**
 * Formate les erreurs Zod en format standardisé
 * @param error - Erreur Zod
 * @param target - Partie de la requête (body, query, params)
 */
function formatZodErrors(error: ZodError, target: ValidationTarget): ValidationError[] {
  return error.issues.map((err: ZodIssue) => ({
    field: `${target}.${err.path.join('.')}`,
    message: err.message,
    code: err.code.toUpperCase(),
    value: 'received' in err ? err.received : 'N/A',
  }));
}

/**
 * Middleware de validation pour le body uniquement
 * @param schema - Schéma Zod pour valider le body
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return validate({ body: schema });
}

/**
 * Middleware de validation pour les query parameters uniquement
 * @param schema - Schéma Zod pour valider les query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return validate({ query: schema });
}

/**
 * Middleware de validation pour les params uniquement
 * @param schema - Schéma Zod pour valider les params
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return validate({ params: schema });
}

/**
 * Middleware de validation personnalisé pour les cas complexes
 * @param validationFn - Fonction de validation personnalisée
 */
export function customValidate(
  validationFn: (req: Request) => ValidationError[] | Promise<ValidationError[]>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = await validationFn(req);
      
      if (errors.length > 0) {
        throw new ValidationAppError(errors);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation conditionnelle basée sur une condition
 * @param condition - Fonction qui détermine si la validation doit être appliquée
 * @param schemas - Schémas de validation à appliquer si la condition est vraie
 */
export function conditionalValidate(
  condition: (req: Request) => boolean,
  schemas: ValidationSchemas
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (condition(req)) {
      return validate(schemas)(req, res, next);
    }
    next();
  };
}

/**
 * Middleware pour valider les fichiers uploadés
 * @param options - Options de validation des fichiers
 */
export interface FileValidationOptions {
  required?: boolean;
  maxSize?: number; // en bytes
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

export function validateFiles(options: FileValidationOptions = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const files = (req as any).files as any[] | undefined;

    // Vérifier si les fichiers sont requis
    if (options.required && (!files || files.length === 0)) {
      errors.push({
        field: 'files',
        message: 'Au moins un fichier est requis',
        code: 'REQUIRED',
      });
    }

    if (files && files.length > 0) {
      // Vérifier le nombre maximum de fichiers
      if (options.maxFiles && files.length > options.maxFiles) {
        errors.push({
          field: 'files',
          message: `Maximum ${options.maxFiles} fichiers autorisés`,
          code: 'TOO_MANY_FILES',
          value: files.length,
        });
      }

      // Valider chaque fichier
      files.forEach((file, index) => {
        // Vérifier la taille
        if (options.maxSize && file.size > options.maxSize) {
          errors.push({
            field: `files[${index}].size`,
            message: `Fichier trop volumineux. Taille maximum: ${options.maxSize} bytes`,
            code: 'FILE_TOO_LARGE',
            value: file.size,
          });
        }

        // Vérifier le type MIME
        if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
          errors.push({
            field: `files[${index}].mimetype`,
            message: `Type de fichier non autorisé. Types acceptés: ${options.allowedMimeTypes.join(', ')}`,
            code: 'INVALID_MIME_TYPE',
            value: file.mimetype,
          });
        }
      });
    }

    if (errors.length > 0) {
      throw new ValidationAppError(errors);
    }

    next();
  };
}