import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value;
    }
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);
    if (errors.length === 0) {
      return value;
    }
    throw new HttpException(
      { errors: this.formatError(errors) },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  formatError(errors: ValidationError[]) {
    return errors.reduce((acc, error) => {
      if (!error.constraints) return acc;
      acc[error.property] = Object.values(error.constraints);
      return acc;
    }, {});
  }
}
