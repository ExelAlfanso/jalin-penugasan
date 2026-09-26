import { expect, it, vi } from 'vitest'

const { connect, end, Client } = vi.hoisted(() => ({
  connect: vi.fn().mockResolvedValue(undefined),
  end: vi.fn().mockResolvedValue(undefined),
  Client: vi.fn(),
}))

Client.mockImplementation(function () { return { connect, end } })
vi.mock('pg', () => ({ Client }))
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: () => ({}) }))

it('closes its one database connection when the operation fails', async () => {
  const { withDb } = await import('../server/db')
  await expect(withDb(async () => { throw new Error('query failed') })).rejects.toThrow('query failed')
  expect(Client).toHaveBeenCalledOnce()
  expect(connect).toHaveBeenCalledOnce()
  expect(end).toHaveBeenCalledOnce()
})
