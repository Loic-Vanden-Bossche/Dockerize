import * as Joi from 'joi';

export class AuthDTO {
  email: string;
  password: string;
}

export const authSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .label('Please provide a valid email address'),
  password: Joi.string()
    .min(8)
    .required()
    .label('Password should be at least 8 chars long'),
});
