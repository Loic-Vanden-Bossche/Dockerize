/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { UnprocessableEntityException } from '@nestjs/common';

export interface IManyToManyRelation {
  fieldName: string;
  service: any;
}

export async function getManyToManyForRelation<A>(
  relation: IManyToManyRelation,
  entity: A,
  secondEntityService: any,
): Promise<A> {
  if (
    entity[relation.fieldName] &&
    entity[relation.fieldName].length &&
    typeof entity[relation.fieldName][0] === 'string'
  ) {
    entity[relation.fieldName] = await Promise.all(
      (entity[relation.fieldName] as unknown as string[]).map(
        async (id: string) => {
          const child = await secondEntityService.findOne(id);
          if (!child) {
            throw new UnprocessableEntityException();
          }
          return child;
        },
      ),
    );
  } else if (entity[relation.fieldName] && !entity[relation.fieldName].length) {
    delete entity[relation.fieldName];
  }

  return entity;
}
