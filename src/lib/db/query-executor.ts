import pool from './pool'

// Allowed tables to prevent SQL injection via table name
const ALLOWED_TABLES = new Set([
  'users', 'empresas', 'vagas', 'candidatos', 'colaboradores',
  'cargos_departamentos', 'gestor_rh_setores',
  'questoes_disc', 'templates_testes', 'respostas_teste', 'feedbacks', 'agendamentos',
  'pdis', 'onboardings', 'treinamentos_ia', 'notificacoes_vaga',
  'alertas_automaticos', 'convites',
])

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

// Validate a single column/table name — word chars and dot only (e.g. "empresa_id", "t.id")
function validIdent(name: string): string {
  if (!/^[\w.]+$/.test(name)) throw new Error(`Invalid identifier: ${name}`)
  return name
}

// Validate a comma-separated column list (e.g. "id, nome, email" or "*")
function validColList(cols: string): string {
  if (!/^[\w.*,\s]+$/.test(cols)) throw new Error(`Invalid column list: ${cols}`)
  return cols
}

/**
 * Parse the select columns string and detect join patterns like:
 *   "*, vaga:vagas(titulo, perfil_disc_ideal), empresa:empresas(nome)"
 *
 * Returns { selectCols, joins } where joins have the info to build LEFT JOINs.
 */
function parseSelectColumns(columns: string, mainTable: string) {
  const joins: { alias: string; foreignTable: string; foreignCols: string[]; fkColumn: string }[] = []
  let remaining = columns

  // Match patterns like "alias:table(col1, col2)"
  const joinRegex = /(\w+):(\w+)\(([^)]+)\)/g
  let match
  while ((match = joinRegex.exec(columns)) !== null) {
    const alias = match[1]
    const foreignTable = match[2]
    const foreignCols = match[3].split(',').map(c => c.trim())

    // Guess FK column: singularize the foreign table name or use alias + "_id"
    let fkColumn = alias + '_id'
    // If alias matches a known pattern like "vaga" for "vagas", use that
    if (!fkColumn.endsWith('_id')) fkColumn = alias + '_id'

    joins.push({ alias, foreignTable, foreignCols, fkColumn })
    remaining = remaining.replace(match[0], '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
  }

  // Clean up remaining select columns
  const mainCols = remaining.trim().replace(/,\s*$/, '').replace(/^\s*,/, '').trim() || '*'

  return { mainCols, joins }
}

export async function buildAndRunQuery(desc: QueryDescriptor) {
  if (!ALLOWED_TABLES.has(desc.table)) {
    return { data: null, error: { message: `Table not allowed: ${desc.table}` }, count: null }
  }

  const params: unknown[] = []
  let paramIdx = 1

  function addParam(val: unknown) {
    // Arrays of objects (e.g. idiomas JSONB) must be serialized to JSON string
    // Arrays of primitives (e.g. hard_skills TEXT[]) stay as-is for pg
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        params.push(JSON.stringify(val))
      } else {
        params.push(val)
      }
    } else if (val !== null && typeof val === 'object') {
      // Plain objects (e.g. perfil_disc_ideal JSONB) must be serialized
      params.push(JSON.stringify(val))
    } else {
      params.push(val)
    }
    return `$${paramIdx++}`
  }

  function buildFilterClause(f: Filter) {
    const col = validIdent(f.column)
    const qualifiedCol = col.includes('.') ? col : `"${desc.table}".${col}`
    switch (f.op) {
      case 'eq': return `${qualifiedCol} = ${addParam(f.value)}`
      case 'neq': {
        if (f.value === '__NOT_NULL__') return `${qualifiedCol} IS NOT NULL`
        return `${qualifiedCol} != ${addParam(f.value)}`
      }
      case 'gt': return `${qualifiedCol} > ${addParam(f.value)}`
      case 'gte': return `${qualifiedCol} >= ${addParam(f.value)}`
      case 'lt': return `${qualifiedCol} < ${addParam(f.value)}`
      case 'lte': return `${qualifiedCol} <= ${addParam(f.value)}`
      case 'like': return `${qualifiedCol} LIKE ${addParam(f.value)}`
      case 'ilike': return `${qualifiedCol} ILIKE ${addParam(f.value)}`
      case 'in': {
        const arr = f.value as unknown[]
        const placeholders = arr.map(v => addParam(v)).join(', ')
        return `${qualifiedCol} IN (${placeholders})`
      }
      case 'is': {
        if (f.value === null) return `${qualifiedCol} IS NULL`
        return `${qualifiedCol} IS ${addParam(f.value)}`
      }
      default: throw new Error(`Unknown op: ${f.op}`)
    }
  }

  // Parse Supabase-style or filter: "col.eq.val,col2.is.null"
  function parseOrFilter(orStr: string): string {
    const parts = orStr.split(',').map(part => {
      const segments = part.trim().split('.')
      if (segments.length < 3) throw new Error(`Invalid or filter: ${part}`)
      const col = validIdent(segments[0])
      const op = segments[1]
      const val = segments.slice(2).join('.')
      const qualifiedCol = col.includes('.') ? col : `"${desc.table}".${col}`

      if (op === 'is' && val === 'null') return `${qualifiedCol} IS NULL`
      if (op === 'eq') return `${qualifiedCol} = ${addParam(val)}`
      if (op === 'neq') return `${qualifiedCol} != ${addParam(val)}`
      if (op === 'gt') return `${qualifiedCol} > ${addParam(val)}`
      if (op === 'lt') return `${qualifiedCol} < ${addParam(val)}`
      throw new Error(`Unsupported or filter op: ${op}`)
    })
    return `(${parts.join(' OR ')})`
  }

  function buildWhere() {
    const allClauses: string[] = []
    if (desc.filters.length > 0) {
      allClauses.push(...desc.filters.map(f => buildFilterClause(f)))
    }
    if (desc.orFilters) {
      allClauses.push(parseOrFilter(desc.orFilters))
    }
    if (allClauses.length === 0) return ''
    return ' WHERE ' + allClauses.join(' AND ')
  }

  try {
    if (desc.type === 'select') {
      const { mainCols, joins } = parseSelectColumns(desc.columns, desc.table)

      // Build select list
      let selectList: string
      if (joins.length > 0) {
        // Main table columns
        const mainSelect = mainCols === '*' ? `"${desc.table}".*` : mainCols.split(',').map(c => `"${desc.table}".${c.trim()}`).join(', ')

        // Join columns as JSON objects
        const joinSelects = joins.map(j => {
          const cols = j.foreignCols.map(c => `'${c}', "${j.alias}".${c}`).join(', ')
          return `json_build_object(${cols}) AS "${j.alias}"`
        })

        selectList = [mainSelect, ...joinSelects].join(', ')
      } else {
        selectList = mainCols === '*' ? '*' : validColList(mainCols)
      }

      // Build FROM + JOINs
      let fromClause = `"${desc.table}"`
      for (const j of joins) {
        if (!ALLOWED_TABLES.has(j.foreignTable)) throw new Error(`Table not allowed: ${j.foreignTable}`)
        fromClause += ` LEFT JOIN "${j.foreignTable}" AS "${j.alias}" ON "${desc.table}".${j.fkColumn} = "${j.alias}".id`
      }

      const whereClause = buildWhere()
      let sql = `SELECT ${selectList} FROM ${fromClause}${whereClause}`
      // Save params snapshot for count query before ORDER/LIMIT are added
      const whereParams = [...params]

      if (desc.order) {
        const orderCol = validIdent(desc.order.column)
        const qualifiedOrder = orderCol.includes('.') ? orderCol : `"${desc.table}".${orderCol}`
        sql += ` ORDER BY ${qualifiedOrder} ${desc.order.ascending ? 'ASC' : 'DESC'}`
      }
      if (desc.limitVal) sql += ` LIMIT ${Number(desc.limitVal)}`

      const result = await pool.query(sql, params)
      let count: number | null = null
      if (desc.countMode === 'exact') {
        const countResult = await pool.query(
          `SELECT COUNT(*) FROM "${desc.table}"${whereClause}`,
          whereParams,
        )
        count = parseInt(countResult.rows[0].count)
      }

      const data = desc.isSingle ? (result.rows[0] ?? null) : result.rows
      return { data, error: null, count }
    }

    if (desc.type === 'insert') {
      if (!desc.body) return { data: null, error: { message: 'No body for insert' }, count: null }
      const keys = Object.keys(desc.body)
      const cols = keys.map(k => validIdent(k)).join(', ')
      const vals = keys.map(k => addParam(desc.body![k])).join(', ')
      const sql = `INSERT INTO "${desc.table}" (${cols}) VALUES (${vals}) RETURNING *`
      const result = await pool.query(sql, params)
      return { data: result.rows[0] ?? null, error: null, count: null }
    }

    if (desc.type === 'update') {
      if (!desc.body) return { data: null, error: { message: 'No body for update' }, count: null }
      const sets = Object.keys(desc.body).map(k => `${validIdent(k)} = ${addParam(desc.body![k])}`).join(', ')
      const sql = `UPDATE "${desc.table}" SET ${sets}${buildWhere()} RETURNING *`
      const result = await pool.query(sql, params)
      return { data: result.rows, error: null, count: null }
    }

    if (desc.type === 'delete') {
      const sql = `DELETE FROM "${desc.table}"${buildWhere()} RETURNING *`
      const result = await pool.query(sql, params)
      return { data: result.rows, error: null, count: null }
    }

    return { data: null, error: { message: `Unknown type: ${desc.type}` }, count: null }
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : String(err) }, count: null }
  }
}
