import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import {
  IPageOptions,
  pageOptionsSchema,
  isComplexSortOptions,
  IMultipleSortOptions,
} from './dto/page-options.interface';
import {
  chainWheres,
  whereLike,
  whereEqual,
  whereSortDirection,
} from '../query-helpers/where-helpers';
import { Page } from './dto/page.dto';
import { SortDirection } from './enum/sort-direction.enum';

@Injectable()
export class PaginatorService {
  public async findPage<T>(
    primaryKey: string,
    page: IPageOptions<T>,
    repository: Repository<T>,
  ): Promise<Page<T>> {
    const { error } = pageOptionsSchema.validate(page);
    if (error) {
      Logger.error(error);
      throw new BadRequestException(error);
    }

    const defaultSortDirection = SortDirection.ASC;
    const alias = 'entity';

    let query = repository.createQueryBuilder(alias);

    if (page.fields) {
      query = query.select(page.fields.map((field) => `${alias}.${field}`));
    }

    const cursors = this._setCursors(
      alias,
      defaultSortDirection,
      primaryKey as keyof T,
      page.from,
      page.sortBy,
    );

    const whereFilter = this._filterBy(
      alias,
      primaryKey,
      page.filterBy,
      page.filterQuery,
    );

    let where: Brackets;
    const whereConditions = [cursors, whereFilter].filter(
      (condition) => !!condition,
    );
    if (whereConditions.length) {
      where = new Brackets((qb) =>
        chainWheres(qb, whereConditions, 'andWhere'),
      );
    } else {
      where = undefined;
    }

    if (where) {
      query = query.where(where);
    }

    query = this._setOrderBy(
      query,
      alias,
      primaryKey as keyof T,
      page,
      defaultSortDirection,
    );

    if (page.perPage) {
      query = query.limit(page.perPage);
    }

    // Execute Query
    let data = [];
    try {
      data = await query.getMany();
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(error.message);
    }

    // Set Metadata
    let nextKey = {};

    if (!page.perPage) {
      nextKey = null;
    } else {
      const lastData = data[data.length - 1];
      nextKey[primaryKey.toString()] = lastData[primaryKey];

      if (isComplexSortOptions(page.sortBy)) {
        for (let i = 0; i < page.sortBy.length; i++) {
          if (page.sortBy[i].key.toString() === primaryKey) {
            continue;
          }
          nextKey[page.sortBy[i].key.toString()] = lastData[page.sortBy[i].key];
        }
      } else if (page.sortBy) {
        nextKey[page.sortBy.toString()] = lastData[page.sortBy];
      }
    }

    const sortedBy = {};

    if (isComplexSortOptions(page.sortBy)) {
      page.sortBy.forEach(
        (sort) =>
          (sortedBy[sort.key.toString()] =
            sort.sortDirection || defaultSortDirection),
      );
      if (!Object.keys(sortedBy).includes(primaryKey)) {
        sortedBy[primaryKey] = defaultSortDirection;
      }
    } else if (page.sortBy) {
      sortedBy[page.sortBy.toString()] =
        page.sortDirection || defaultSortDirection;
      if (page.sortBy !== primaryKey) {
        sortedBy[primaryKey] = defaultSortDirection;
      }
    }

    return new Page<T>({
      data,
      metadata: {
        nextKey: nextKey ? nextKey : null,
        limit: page.perPage ? Number(page.perPage) : null,
        sortedBy,
        filteredBy: {
          fields: page.filterBy
            ? page.filterBy.map((key) => key.toString())
            : page.filterQuery
            ? [primaryKey]
            : null,
          query: page.filterQuery ? page.filterQuery : null,
        },
      },
    });
  }
  /**
   * Set the Order by clauses
   * @param query - the query to be ordered
   * @param alias - the entity name
   * @param primaryKey - the entity primaryKey
   * @param pageOptions - page options
   * @param defaultSortDirection - used in case of no sort options or no sort direction provided
   * @returns a query builder with the sorting option @if sortBy is truthy,
   * with default sortDirection on primaryKey otherwise @otherwise
   */
  private _setOrderBy<T>(
    query: SelectQueryBuilder<T>,
    alias: string,
    primaryKey: keyof T,
    pageOptions: IPageOptions<T>,
    defaultSortDirection: SortDirection,
  ): SelectQueryBuilder<T> {
    if (isComplexSortOptions(pageOptions.sortBy)) {
      for (let i = 0; i < pageOptions.sortBy.length; i++) {
        const direction = pageOptions.sortBy[i].sortDirection
          ? pageOptions.sortBy[i].sortDirection
          : defaultSortDirection;
        if (i === 0) {
          query = query.orderBy(
            `${alias}.${pageOptions.sortBy[i].key}`,
            direction,
          );
          continue;
        }
        query = query.addOrderBy(
          `${alias}.${pageOptions.sortBy[i].key}`,
          direction,
        );
      }
    } else if (pageOptions.sortBy) {
      query = query.orderBy(
        `${alias}.${pageOptions.sortBy}`,
        pageOptions.sortDirection
          ? pageOptions.sortDirection
          : defaultSortDirection,
      );
    } else {
      query = query.orderBy(`${alias}.${primaryKey}`, defaultSortDirection);
    }

    return query;
  }
  /**
   * set the WHERE clauses with LIKE operator to filter
   * @param alias - the name of the entity
   * @param primaryKey - the entity's primary key
   * @param keys - the entity columns on which the filter is applied
   * @param query - the researched value
   * @returns TypeORM "Brackets" condition @if query is truthy, undefined @otherwise
   */
  private _filterBy<T>(
    alias: string,
    primaryKey: string,
    keys?: Array<keyof T>,
    query?: string,
  ): Brackets | undefined {
    const fields = keys ? keys.map((key) => key.toString()) : [primaryKey];
    const conditions = query
      ? fields.map((key) => whereLike(alias, key, query))
      : [];
    if (conditions.length) {
      return new Brackets((qb) => chainWheres(qb, conditions, 'orWhere'));
    }
    return undefined;
  }
  /**
   * Set the WHERE clauses to get a page from a given set of keys
   *
   * @param alias - the name of the entity
   * @param defaultSortDirection - used in case of no sort options or no sort direction provided
   * @param primaryKey - the entity's primary key
   * @param cursors - keys and values from which the request will query the data
   * @param sort - sorting options (simple or complexe)
   * @param sortDirection - sort direction in case of a simple sort
   * @returns TypeORM "Brackets" condition @if cursors is truthy, undefined @otherwise
   */
  private _setCursors<T>(
    alias: string,
    defaultSortDirection: SortDirection,
    primaryKey: keyof T,
    cursors,
    sort: keyof T | IMultipleSortOptions<T>,
    sortDirection?: SortDirection,
  ): Brackets | undefined {
    if (!cursors) {
      return undefined;
    }
    // Set sortBy option depending on type received
    let sortBy: IMultipleSortOptions<T> = [];
    if (sort) {
      sortBy = Array.isArray(sort)
        ? sort
        : [
            {
              key: sort,
              sortDirection: sortDirection
                ? sortDirection
                : defaultSortDirection,
            },
          ];
    }
    // Add default sort on primary key if not given in page options
    if (!sortBy.find((s) => s.key === primaryKey)) {
      sortBy.push({
        key: primaryKey,
        sortDirection: defaultSortDirection,
      });
    }
    // Create WhereExpressions for non primary keys
    const conditions = [];
    for (const key of Object.keys(cursors)) {
      const tempConditions = [];
      if (key === primaryKey) {
        continue;
      }
      const sortCondititon = sortBy.find((s) => s.key === key);
      const sortDirection =
        sortCondititon != null
          ? sortCondititon.sortDirection
          : defaultSortDirection;
      tempConditions.push(
        whereSortDirection(alias, cursors[key], key as keyof T, sortDirection),
      );
      tempConditions.push(whereEqual(alias, cursors[key], key));
      conditions.push(
        new Brackets((qb) => chainWheres(qb, tempConditions, 'orWhere')),
      );
    }
    const bracketConditions = conditions.length
      ? new Brackets((qb) => chainWheres(qb, conditions, 'andWhere'))
      : undefined;

    // Create WhereExpression for the primary key
    const primaryKeySortCondititon = sortBy.find((s) => s.key === primaryKey);
    const primaryKeySortDirection =
      primaryKeySortCondititon != null
        ? primaryKeySortCondititon.sortDirection
        : defaultSortDirection;
    const primaryCondition = whereSortDirection(
      alias,
      cursors[primaryKey],
      primaryKey,
      primaryKeySortDirection,
    );
    const bracketPrimaryCondition = new Brackets((qb) =>
      qb.andWhere(primaryCondition),
    );

    return new Brackets((qb) =>
      chainWheres(
        qb,
        [bracketConditions, bracketPrimaryCondition].filter((b) => !!b),
        'andWhere',
      ),
    );
  }
}
