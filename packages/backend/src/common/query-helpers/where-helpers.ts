import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { SortDirection } from '../paginator/enum/sort-direction.enum';

type WhereOperation = 'orWhere' | 'andWhere';

const checkKey = <T>(key: keyof T) => {
  if (key == null) {
    throw new Error(`Tried to filter with a where clause on undefined key`);
  }
};

// TODO: Extends with all possible values
type ColumnValue = string | number | Date | boolean;

/**
 * Build a WHERE clause on a given column to be used by TypeORM
 * Query builder.
 * @param cursor - the value for which returned values must be greater than
 * @param key - the column on which we apply the where condition
 * @returns TypeORM "Brackets" condition @if cursor is truthy, undefined @otherwise
 */
export const whereSuperior = <T>(
  alias: string,
  cursor: ColumnValue,
  key: keyof T,
): Brackets => {
  checkKey(key);
  return cursor != null
    ? new Brackets((qb) => {
        return qb.where(`${alias}.${key} > :from_${key}`, {
          [`from_${key}`]: cursor,
        });
      })
    : undefined;
};

/**
 * Build a WHERE clause on a given column to be used by TypeORM
 * Query builder.
 * @param cursor - the value for which returned values must be greater than
 * @param key - the column on which we apply the where condition
 * @returns TypeORM "Brackets" condition @if cursor is truthy, undefined @otherwise
 */
export const whereInferior = <T>(
  alias: string,
  cursor: ColumnValue,
  key: keyof T,
): Brackets => {
  checkKey(key);
  return cursor != null
    ? new Brackets((qb) => {
        return qb.where(`${alias}.${key} < :from_${key}`, {
          [`from_${key}`]: cursor,
        });
      })
    : undefined;
};

/**
 * Build a WHERE clause on a given column to be used by TypeORM
 * Query builder.
 * @param cursor - the value for which returned values must be greater than
 * @param key - the column on which we apply the where condition
 * @param sortDirection - sort direction
 * @returns TypeORM "Brackets" condition @if cursor is truthy, undefined @otherwise
 */
export const whereSortDirection = <T>(
  alias: string,
  cursor: ColumnValue,
  key: keyof T,
  sortDirection: SortDirection,
): Brackets => {
  if (sortDirection === SortDirection.DESC) {
    return whereInferior(alias, cursor, key);
  } else {
    return whereSuperior(alias, cursor, key);
  }
};

/**
 * Build a WHERE clause on a given column to be used by TypeORM
 * Query builder.
 * @param cursor - the value for which returned values must be greater than
 * @param key - the column on which we apply the where condition
 * @returns TypeORM "Brackets" condition @if cursor is truthy, undefined @otherwise
 */
export const whereEqual = <T>(
  alias: string,
  cursor: ColumnValue,
  key: keyof T,
): Brackets => {
  checkKey(key);
  return cursor !== null
    ? new Brackets((qb) => {
        return qb.where(`${alias}.${key} = :from_${key}`, {
          [`from_${key}`]: cursor,
        });
      })
    : undefined;
};

/**
 * Build a WHERE clause on a given column to be used by TypeORM
 * Query builder.
 * @param cursor - the value for which returned values must be greater than
 * @param key - the column on which we apply the where condition
 * @returns TypeORM "Brackets" condition @if cursor is truthy, undefined @otherwise
 */
export const whereLike = <T>(
  alias: string,
  key: keyof T,
  query: string,
): Brackets => {
  checkKey(key);
  return query !== null
    ? new Brackets((qb) => {
        return qb.where(`${alias}.${key} LIKE :filterBy_${key}`, {
          [`filterBy_${key}`]: `%${query}%`,
        });
      })
    : null;
};

/**
 * Build a WHERE clause with AND / OR operators between given multiple
 * conditions.
 * @param qb - the where factory
 * @param brackets - the where conditions to chain
 * @param operation - "orWhere" or "andWhere"
 */
export const chainWheres = (
  qb: WhereExpressionBuilder,
  brackets: Brackets[],
  operation: WhereOperation,
): WhereExpressionBuilder => {
  if (brackets.length) {
    qb.where(brackets[0]);
    for (let i = 1; i < brackets.length; i++) {
      qb = qb[operation](brackets[i]);
    }
  }
  return qb;
};
