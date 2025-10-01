import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * ================================
 * MIDDLEWARE DE VALIDATION ZOD
 * Application Gestion des Salaires
 * ================================
 */

/**
 * Interface pour les erreurs de validation formatées
 */
export interface ValidationError {
  errors: Record<string, string>;
  message: string;
}

/**
 * Formater les erreurs Zod en format standardisé
 */
export const formatZodErrors = (error: ZodError): ValidationError => {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return {
    errors,
    message: 'Erreurs de validation'
  };
};

/**
 * Middleware pour valider le body de la requête
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodErrors(error);
        return res.status(400).json(formattedError);
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider les paramètres de la requête
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodErrors(error);
        return res.status(400).json(formattedError);
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider la query string
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodErrors(error);
        return res.status(400).json(formattedError);
      }
      next(error);
    }
  };
};

/**
 * Middleware pour vérifier l'unicité (email, téléphone, nom d'entreprise)
 */
export interface UniquenessCheck {
  field: string;
  table: string;
  excludeId?: number;
  message?: string;
}

export const checkUniqueness = (checks: UniquenessCheck[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prisma } = req.app.locals;
      const errors: Record<string, string> = {};

      for (const check of checks) {
        const value = req.body[check.field];
        if (!value) continue;

        const whereClause: any = { [check.field]: value };
        
        // Exclure l'ID actuel lors des modifications
        if (check.excludeId) {
          whereClause.NOT = { id: check.excludeId };
        }

        const existing = await prisma[check.table].findFirst({
          where: whereClause
        });

        if (existing) {
          errors[check.field] = check.message || `Cette valeur est déjà utilisée`;
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          errors,
          message: 'Erreurs de validation'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware combiné pour validation complète
 */
export const validate = {
  body: validateBody,
  params: validateParams,
  query: validateQuery,
  unique: checkUniqueness
};

/**
 * Helper pour créer des validations communes
 */
export const createValidation = {
  /**
   * Validation pour la création d'utilisateur avec vérification d'unicité
   */
  createUser: (schema: ZodSchema) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'email', table: 'utilisateur', message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'utilisateur', message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ],

  /**
   * Validation pour la modification d'utilisateur avec vérification d'unicité
   */
  updateUser: (schema: ZodSchema, userId: number) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'email', table: 'utilisateur', excludeId: userId, message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'utilisateur', excludeId: userId, message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ],

  /**
   * Validation pour la création d'entreprise avec vérification d'unicité
   */
  createEntreprise: (schema: ZodSchema) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'nom', table: 'entreprise', message: 'Une entreprise avec ce nom existe déjà' },
      { field: 'email', table: 'entreprise', message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'entreprise', message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ],

  /**
   * Validation pour la modification d'entreprise avec vérification d'unicité
   */
  updateEntreprise: (schema: ZodSchema, entrepriseId: number) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'nom', table: 'entreprise', excludeId: entrepriseId, message: 'Une entreprise avec ce nom existe déjà' },
      { field: 'email', table: 'entreprise', excludeId: entrepriseId, message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'entreprise', excludeId: entrepriseId, message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ],

  /**
   * Validation pour la création d'employé avec vérification d'unicité
   */
  createEmploye: (schema: ZodSchema) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'email', table: 'employe', message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'employe', message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ],

  /**
   * Validation pour la modification d'employé avec vérification d'unicité
   */
  updateEmploye: (schema: ZodSchema, employeId: number) => [
    validateBody(schema),
    checkUniqueness([
      { field: 'email', table: 'employe', excludeId: employeId, message: 'Cet email est déjà utilisé' },
      { field: 'telephone', table: 'employe', excludeId: employeId, message: 'Ce numéro de téléphone est déjà utilisé' }
    ])
  ]
};

/**
 * Middleware global pour gérer les erreurs de validation
 */
export const handleValidationErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ZodError) {
    const formattedError = formatZodErrors(error);
    return res.status(400).json(formattedError);
  }
  
  // Si ce n'est pas une erreur de validation Zod, passer au middleware d'erreur suivant
  next(error);
};