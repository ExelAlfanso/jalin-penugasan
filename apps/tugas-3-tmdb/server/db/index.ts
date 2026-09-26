import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

export async function withDb<T>(run: (db: NodePgDatabase) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    return await run(drizzle({ client }))
  } finally {
    await client.end()
  }
}
