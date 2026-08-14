import { getTableColumns, type Table } from 'drizzle-orm'

function isTimestampColumn(column: { columnType: string }): boolean {
  return column.columnType.includes('Timestamp')
}

export function prepareForDb<T extends Table>(
  table: T,
  data: Record<string, unknown>,
): T['$inferInsert'] {
  const columns = getTableColumns(table)
  const result: Record<string, unknown> = {}

  for (const key of Object.keys(data)) {
    const column = columns[key]
    if (!column) continue

    const value = data[key]
    if (isTimestampColumn(column) && typeof value === 'string') {
      result[key] = new Date(value)
    } else {
      result[key] = value
    }
  }

  return result as T['$inferInsert']
}
