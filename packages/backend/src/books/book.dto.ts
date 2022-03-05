import * as Joi from 'joi';

export class CreateBookDTO {
  isbn: string;
  title: string;
  author: string | null;
  overview: string | null;
  read_count: number;
  picture: string | null;
}

export class UpdateBookDTO {
  read_count: number;
}

export const createBookSchema = Joi.object().keys({
  isbn: Joi.string()
    .required()
    .length(13)
    .label('Please provide an isbn of length 13'),
  title: Joi.string()
    .required()
    .label('Please provide a title'),
  author: Joi.string()
    .required()
    .allow(null)
    .label('Please provide an author'),
  overview: Joi.string()
    .required()
    .allow(null)
    .label('Please provide an overview'),
  read_count: Joi.number()
    .required()
    .min(1)
    .label('Please provide a read-count with a minimum of 1'),
  picture: Joi.string()
    .allow(null)
    .label('Please provide a picture'),
});

export const updateBookSchema = Joi.object().keys({
  read_count: Joi.number().required().min(1).label('Please provide a read-count with a minimum of 1'),
});
