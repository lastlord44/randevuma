// tests/smoke.spec.ts
import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'https://randevuma.com'

// 1) Fast page loads
test('fast page loads and shows grid', async ({ page }) => {
  await page.goto(`${BASE}/b/demo/fast`, { waitUntil: 'networkidle' })
  await expect(page.getByText(/Tüm Saatler/i)).toBeVisible()
})

// 2) Pretty staff url selects staff
test('pretty staff url selects Mehmet Kaya', async ({ page }) => {
  await page.goto(`${BASE}/b/demo/s/mehmet-kaya`, { waitUntil: 'networkidle' })
  await expect(page.getByText(/Mehmet Kaya/i)).toBeVisible()
})

// 3) API returns slots
test('next-slots api returns data', async ({ request }) => {
  const res = await request.get(`${BASE}/api/fast/next-slots?businessSlug=demo&serviceId=service-2`)
  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(Array.isArray(json?.slots)).toBeTruthy()
})

