import puppeteer, { Page, Browser } from "puppeteer"
import dotenv from "dotenv"
import { format_date, format_value } from "./formatter"

dotenv.config()

const {
  EBANKING_URL = "",
  EBANKING_USERNAME = "",
  EBANKING_PASSWORD = "",
  FINANCES_API_ACCOUNT_NAME,
} = process.env

const parseTransactionsPage = async (page: Page) => {
  const transactions = await page.$$eval(
    ".account-activity-table__body__tr",
    (rows) =>
      rows.map((row) => {
        const date = row.querySelector(
          ".account-activity-table__td--date"
        )?.textContent
        const description = row.querySelector(
          ".account-activity-table__td--name"
        )?.textContent
        const amount = row.querySelector(
          ".account-activity-table__td--activity"
        )?.textContent
        const balance = row.querySelector(
          ".account-activity-table__td--balance"
        )?.textContent

        if (!date) throw "Missing date"
        if (!amount) throw "Missing amount"

        return {
          date,
          amount,
          balance,
          description,
        }
      })
  )

  const balanceString = transactions.at(-1)?.balance
  if (!balanceString) throw "Balance undefined"

  return {
    balance: format_value(balanceString),
    transactions: transactions
      .filter((transaction) => transaction.date)
      .map(({ date, amount, description }) => ({
        date: format_date(date),
        account: FINANCES_API_ACCOUNT_NAME,
        currency: "JPY",
        description,
        amount: format_value(amount),
      })),
  }
}

export const scrape = async () => {
  console.log(`[Scraper] Scraper started`)

  let browser: Browser

  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  } catch {
    browser = await puppeteer.launch()
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(EBANKING_URL)

  console.log("[Scraper] Logging in...")

  await page.type("#loginId", EBANKING_USERNAME)
  await page.keyboard.press("Enter")
  await page.waitForSelector("#loginPassword")
  await page.type("#loginPassword", EBANKING_PASSWORD)
  await page.keyboard.press("Enter")

  await page.waitForSelector(
    ".global-navigation__inner__item__second-menu__item__link"
  )

  // TODO: ignore password change

  console.log("[Scraper] Logged in")
  console.log("[Scraper] Navigating to transactions table page...")

  const menu = await page.$(".home-menu__list")
  const menuItems = await menu?.$$("li")
  if (!menuItems) throw "Home page menu items not found"
  const link = await menuItems[0].$("a")
  if (!link) throw "Link to transactions table not found"
  link.click()

  await page.waitForNavigation({ timeout: 5000 })

  console.log("[Scraper] Navigated to transactions table page")

  const { balance, transactions } = await parseTransactionsPage(page)

  await browser.close()

  return {
    balance,
    transactions,
  }
}
