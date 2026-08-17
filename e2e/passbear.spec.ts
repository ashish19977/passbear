import { expect, test } from '@playwright/test'

test.describe('PassBear', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage loads with brand, tagline and privacy message', async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/PassBear/i)
    await expect(
      page.getByRole('heading', { level: 1, name: /passbear/i }),
    ).toBeVisible()
    await expect(page.getByText(/created locally/i)).toBeVisible()
    await expect(
      page.getByText(/never leave your device/i),
    ).toBeVisible()
  })

  test('a password is present and Generate produces a new one', async ({
    page,
  }) => {
    const field = page.getByRole('textbox', { name: /generated password/i })
    const initial = (await field.textContent())?.trim() ?? ''
    expect(initial.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Generate' }).click()
    await expect
      .poll(async () => (await field.textContent())?.trim())
      .not.toBe(initial)
  })

  test('switching generator types updates the settings', async ({ page }) => {
    // Friendly (default) shows a Minimum length slider.
    await expect(page.getByText('Minimum length')).toBeVisible()

    await page.getByRole('radio', { name: 'PIN' }).click()
    await expect(page.getByText('PIN length')).toBeVisible()
    const field = page.getByRole('textbox', { name: /generated password/i })
    await expect
      .poll(async () => (await field.textContent())?.trim())
      .toMatch(/^[0-9]+$/)

    await page.getByRole('radio', { name: 'Passphrase' }).click()
    await expect(page.getByText('Words', { exact: true })).toBeVisible()
  })

  test('changing a setting updates the password', async ({ page }) => {
    await page.getByRole('radio', { name: 'PIN' }).click()
    const field = page.getByRole('textbox', { name: /generated password/i })
    await expect.poll(async () => (await field.textContent())?.trim()).toMatch(/^[0-9]+$/)

    const before = (await field.textContent())?.trim() ?? ''
    const slider = page.getByRole('slider', { name: /PIN length/i })
    await slider.focus()
    await slider.press('ArrowRight')

    // Length should have grown by one digit.
    await expect
      .poll(async () => ((await field.textContent())?.trim() ?? '').length)
      .toBeGreaterThan(before.length)
  })

  test('copy button copies the password', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard read is chromium-only here')
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    const field = page.getByRole('textbox', { name: /generated password/i })
    const value = (await field.textContent())?.trim() ?? ''
    await page.getByRole('button', { name: /copy password/i }).click()
    await expect(page.getByText('Copied')).toBeVisible()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toBe(value)
  })

  test('legal and contact dialogs open and close', async ({ page }) => {
    await page.getByRole('button', { name: 'Privacy' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Privacy Policy' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Close dialog' }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole('button', { name: 'Terms & Conditions' }).click()
    await expect(
      page.getByRole('heading', { name: 'Terms & Conditions' }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()

    await page.getByRole('button', { name: 'Contact' }).click()
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible()
  })

  test('advanced prefix and suffix apply to the password', async ({ page }) => {
    await page.getByRole('button', { name: 'Advanced settings' }).click()
    await page.getByLabel('Starts with').fill('My')
    await page.getByLabel('Ends with').fill('!')
    const field = page.getByRole('textbox', { name: /generated password/i })
    await expect
      .poll(async () => (await field.textContent())?.trim())
      .toMatch(/^My.*!$/)
    await expect(page.getByText(/contribute no randomness/i)).toBeVisible()
  })

  test('edit mode changes the password and shows an estimate warning', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Edit password' }).click()
    const input = page.getByRole('textbox', { name: 'Edit password' })
    await input.fill('MyCustomPass123')
    await expect(input).toHaveValue('MyCustomPass123')
    await expect(page.getByText(/only an estimate/i)).toBeVisible()
  })
})

test.describe('PassBear mobile', () => {
  test('layout works and controls are usable on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: /passbear/i }),
    ).toBeVisible()
    const generate = page.getByRole('button', { name: 'Generate' })
    await expect(generate).toBeVisible()

    const box = await generate.boundingBox()
    // Comfortable one-handed tap target height on mobile.
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40)
    await generate.click()
    await expect(
      page.getByRole('textbox', { name: /generated password/i }),
    ).toBeVisible()
  })
})
