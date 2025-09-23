class QueryBuilder {
  private url: string;
  private params: URLSearchParams;

  constructor(baseUrl: string) {
    this.url = baseUrl;
    this.params = new URLSearchParams();
  }

  static generateURL(path: string): QueryBuilder {
    return new QueryBuilder(path);
  }

  static generateSearchParams(): QueryBuilderSearchParams {
    return new QueryBuilderSearchParams();
  }

  setQueryParam(key: string, value: string | number | boolean | null | undefined): this {
    if (value === null || value === undefined || value === '') {
      this.params.delete(key);
    } else {
      this.params.set(key, String(value));
    }
    return this;
  }

  build(): string {
    const queryString = this.params.toString();
    return queryString ? `${this.url}?${queryString}` : this.url;
  }
}

class QueryBuilderSearchParams {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
  }

  setPage(page: number | undefined): this {
    if (page !== undefined && page > 0) {
      this.params.set('page', String(page));
    }
    return this;
  }

  setLimit(limit: number | undefined): this {
    if (limit !== undefined && limit > 0) {
      this.params.set('limit', String(limit));
    }
    return this;
  }

  setSearch(search: string | undefined): this {
    if (search !== undefined && search !== '') {
      this.params.set('search', search);
    } else {
      this.params.delete('search');
    }
    return this;
  }

  setQueryParam(key: string, value: string | number | boolean | null | undefined): this {
    if (value === null || value === undefined || value === '') {
      this.params.delete(key);
    } else {
      this.params.set(key, String(value));
    }
    return this;
  }

  get search(): string {
    const queryString = this.params.toString();
    return queryString ? `?${queryString}` : '';
  }
}

export { QueryBuilder };