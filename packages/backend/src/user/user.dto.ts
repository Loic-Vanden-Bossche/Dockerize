import * as Joi from 'joi';

export class CreateUserDTO {
  username: string;
  email: string;
  password: string;
  roles: number[];
}

export const userSchema = Joi.object().keys({
  username: Joi.string().required().label('Username is required'),
  email: Joi.string()
    .email()
    .required()
    .label('Please provide a valid email address'),
  password: Joi.string()
    .min(8)
    .required()
    .label('Password should be at least 8 chars long'),
  roles: Joi.array().items(Joi.number()).optional(),
});
