/**
 * Client-side query builder that sends queries to /api/db proxy endpoint.
 * Mimics the Supabase client API surface.
 */

// ─── Types ───────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
interface QueryResult {
  data: any[] | null
  error: { message: string } | null
  count: number | null
}

interface SingleResult {
  data: any | null
  error: { message: string } | null
}

type FilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is'

interface Filter {
  column: string
  op: FilterOp
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

// ─── Builder ─────────────────────────────────────────────────────────

class QueryBuilder {
  private desc: QueryDescriptor

  constructor(
    private executor: (desc: QueryDescriptor) => Promise<{ data: unknown; error: unknown; count: number | null }>,
    table: string,
    type: 'select' | 'insert' | 'update' | 'delete',
    columns: string,
    countMode: 'exact' | null,
    body: Record<string, unknown> | null,
  ) {
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
  not(column: string, op: string, value: unknown) {
    if (op === 'is' && value === null) {
      this.desc.filters.push({ column, op: 'neq' as FilterOp, value: '__NOT_NULL__' })
    }
    return this
  }
  or(filterString: string) { this.desc.orFilters = filterString; return this }

  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.desc.order = { column, ascending: opts?.ascending ?? true }
    return this
  }

  limit(n: number) {
    this.desc.limitVal = n
    return this
  }

  single(): Promise<SingleResult> {
    this.desc.isSingle = true
    return this.then() as Promise<SingleResult>
  }

  async then(
    resolve?: (val: QueryResult) => unknown,
    reject?: (err: unknown) => unknown,
  ): Promise<QueryResult> {
    try {
      const result = await this.executor(this.desc)
      const out = result as QueryResult
      return resolve ? resolve(out) as unknown as QueryResult : out
    } catch (err) {
      if (reject) { reject(err); return { data: null, error: { message: String(err) }, count: null } }
      throw err
    }
  }
}

// ─── Table helper ────────────────────────────────────────────────────

class TableRef {
  constructor(
    private executor: (desc: QueryDescriptor) => Promise<{ data: unknown; error: unknown; count: number | null }>,
    private table: string,
  ) {}

  select(columns = '*', opts?: { count?: 'exact'; head?: boolean }) {
    return new QueryBuilder(this.executor, this.table, 'select', columns, opts?.count ?? null, null)
  }

  insert(body: Record<string, unknown> | Record<string, unknown>[]) {
    const row = Array.isArray(body) ? body[0] : body
    return new QueryBuilder(this.executor, this.table, 'insert', '*', null, row)
  }

  update(body: Record<string, unknown>) {
    return new QueryBuilder(this.executor, this.table, 'update', '*', null, body)
  }

  delete() {
    return new QueryBuilder(this.executor, this.table, 'delete', '*', null, null)
  }
}

// ─── Client-side: fetch via /api/db ──────────────────────────────────

export function createClient() {
  const executor = async (desc: QueryDescriptor) => {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(desc),
      credentials: 'include',
    })
    return res.json()
  }

  return {
    from(table: string) { return new TableRef(executor, table) },
  }
}
