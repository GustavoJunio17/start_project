/**
 * Server-side query client — uses pool directly (no HTTP round-trip).
 * Works in Server Components, API routes, and middleware.
 */

import { buildAndRunQuery } from './query-executor'

interface Filter {
  column: string
  op: string
  value: unknown
}

interface OrderClause {
  column: string
  ascending: boolean
}

interface QueryDescriptor {
  table: string
  type: 'select' | 'insert' | 'update' | 'delete'
  columns: string
  filters: Filter[]
  orFilters: string | null
  order: OrderClause | null
  limitVal: number | null
  countMode: 'exact' | null
  body: Record<string, unknown> | null
  isSingle: boolean
}

class ServerQueryBuilder<T = Record<string, unknown>> {
  private desc: QueryDescriptor

  constructor(table: string, type: QueryDescriptor['type'], columns: string, countMode: 'exact' | null, body: Record<string, unknown> | null) {
    this.desc = { table, type, columns, filters: [], orFilters: null, order: null, limitVal: null, countMode, body, isSingle: false }
  }

  eq(column: string, value: unknown) { this.desc.filters.push({ column, op: 'eq', value }); return this }
  neq(column: string, value: unknown) { this.desc.filters.push({ column, op: 'neq', value }); return this }
  gt(column: string, value: unknown) { this.desc.filters.push({ column, op: 'gt', value }); return this }
  gte(column: string, value: unknown) { this.desc.filters.push({ column, op: 'gte', value }); return this }
  lt(column: string, value: unknown) { this.desc.filters.push({ column, op: 'lt', value }); return this }
  lte(column: string, value: unknown) { this.desc.filters.push({ column, op: 'lte', value }); return this }
  like(column: string, value: unknown) { this.desc.filters.push({ column, op: 'like', value }); return this }
  ilike(column: string, value: unknown) { this.desc.filters.push({ column, op: 'ilike', value }); return this }
  in(column: string, values: unknown[]) { this.desc.filters.push({ column, op: 'in', value: values }); return this }
  is(column: string, value: unknown) { this.desc.filters.push({ column, op: 'is', value }); return this }
  or(filterString: string) { this.desc.orFilters = filterString; return this }

  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.desc.order = { column, ascending: opts?.ascending ?? true }
    return this
  }

  limit(n: number) { this.desc.limitVal = n; return this }

  async single() {
    this.desc.isSingle = true
    return this.execute() as Promise<{ data: T | null; error: { message: string } | null }>
  }

  async then(
    resolve?: (val: { data: T[] | null; error: { message: string } | null; count: number | null }) => unknown,
    reject?: (err: unknown) => unknown,
  ) {
    try {
      const result = await this.execute()
      return resolve ? resolve(result as { data: T[] | null; error: { message: string } | null; count: number | null }) : result
    } catch (err) {
      if (reject) return reject(err)
      throw err
    }
  }

  private execute() {
    return buildAndRunQuery(this.desc)
  }
}

class ServerTableRef {
  constructor(private table: string) {}

  select(columns = '*', opts?: { count?: 'exact' }) {
    return new ServerQueryBuilder(this.table, 'select', columns, opts?.count ?? null, null)
  }

  insert(body: Record<string, unknown> | Record<string, unknown>[]) {
    const row = Array.isArray(body) ? body[0] : body
    return new ServerQueryBuilder(this.table, 'insert', '*', null, row)
  }

  update(body: Record<string, unknown>) {
    return new ServerQueryBuilder(this.table, 'update', '*', null, body)
  }

  delete() {
    return new ServerQueryBuilder(this.table, 'delete', '*', null, null)
  }
}

export function createServerClient() {
  return {
    from(table: string) { return new ServerTableRef(table) },
  }
}
