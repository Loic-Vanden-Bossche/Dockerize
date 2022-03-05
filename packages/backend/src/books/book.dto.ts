import * as Joi from 'joi';

export class BookDTO {
  isbn: string;
  title: string;
  author: string;
  overview: string;
  read_count: number;
  picture: any;
}

export const bookSchema = Joi.object().keys({
  isbn: Joi.string().required().length(13),
  title: Joi.string().required(),
  author: Joi.string().required(),
  overview: Joi.string().required(),
  read_count: Joi.number().required().min(1),
  picture: Joi.string(),
});
