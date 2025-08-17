import { ValidationError } from 'class-validator';

export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    if (error.constraints) {
      result[error.property] = Object.values(error.constraints);
    }

    // handle nested validation (optional)
    if (error.children && error.children.length > 0) {
      for (const child of error.children) {
        if (child.constraints) {
          const key = `${error.property}.${child.property}`;
          result[key] = Object.values(child.constraints);
        }
      }
    }
  }

  return result;
}
