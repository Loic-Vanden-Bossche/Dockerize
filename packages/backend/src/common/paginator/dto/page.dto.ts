import { SortDirection } from '../enum/sort-direction.enum';

export class Page<T> {
  data: Array<T>;
  metadata: {
    nextKey: {
      [key: string]: string;
    };
    limit: number;
    sortedBy: {
      [key: string]: SortDirection;
    };
    filteredBy: {
      fields: string[];
      query: string;
    };
  };
  constructor(options: Partial<Page<T>>) {
    Object.assign(this, options);
  }
}
