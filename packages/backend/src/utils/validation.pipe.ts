import Joi from 'joi';
import {
  PipeTransform,
  Injectable,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: Joi.ObjectSchema,
    private readonly code = 422,
  ) {}

  transform(value: unknown): unknown {
    const { error } = this.schema.validate(value);
    if (error) {
      if (this.code === 400) {
        throw new BadRequestException({
          errors: error,
          message: 'Validation error',
        });
      }
      throw new UnprocessableEntityException({
        errors: error,
        message: 'Validation error',
      });
    }
    return value;
  }
}
