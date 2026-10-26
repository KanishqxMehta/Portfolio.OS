import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/auth', () => ({ auth: vi.fn(async () => ({ user: { id: 'owner' } })) }));
vi.mock('@/lib/db', () => ({ pool: { query: vi.fn() } }));
import { pool } from '@/lib/db';
import { GET } from '@/app/api/portfolio-draft/route';
afterEach(() => vi.restoreAllMocks());
it('returns a private, friendly 503 when the draft table is unavailable', async () => {
  vi.mocked(pool.query).mockRejectedValueOnce(Object.assign(new Error('relation PortfolioDraft does not exist'), { code: '42P01' }));
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.json()).toEqual({ error: expect.stringContaining('temporarily unavailable') });
  expect(log).toHaveBeenCalledOnce();
});
