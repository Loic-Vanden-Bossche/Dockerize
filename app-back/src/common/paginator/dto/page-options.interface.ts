import { SortDirection } from '../enum/sort-direction.enum';
import Joi from 'joi';

interface ISortOptions<T> {
  key: keyof T;
  sortDirection?: SortDirection; // default ASC
}

export type IMultipleSortOptions<T> = ISortOptions<T>[];

export interface IPageOptions<T> {
  fields?: string[];
  from?: {
    [key: string]: string;
  };
  perPage?: number;
  sortBy?: keyof T | IMultipleSortOptions<T>;
  sortDirection?: SortDirection;
  filterBy?: Array<keyof T>;
  filterQuery?: string;
}

export const pageOptionsSchema = Joi.object().keys({
  fields: Joi.array().items(Joi.string()).optional(),
  from: Joi.object().optional(),
  perPage: Joi.number().optional(),
  sortBy: Joi.alternatives([
    Joi.string(),
    Joi.array().items(
      Joi.object().keys({
        key: Joi.string().required(),
        sortDirection: Joi.string().valid('ASC', 'DESC'),
      }),
    ),
  ]).optional(),
  sortDirection: Joi.string().valid('ASC', 'DESC').optional(),
  filterBy: Joi.array().items(Joi.string()),
  filterQuery: Joi.string(),
});

export const isComplexSortOptions = <T>(
  sortBy: keyof T | IMultipleSortOptions<T>,
): sortBy is IMultipleSortOptions<T> => {
  return Array.isArray(sortBy);
};
