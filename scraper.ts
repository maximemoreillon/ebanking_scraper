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
    "#ctl00_cphBizConf_gdvAcntInfo tr",
    (rows) =>
      rows.map((row) => {
        const [date, expense, income, balance, description] = Array.from(
          row.querySelectorAll("td")
        ).reduce((acc: any, cell) => [...acc, cell.textContent?.trim()], [])

        return { date, expense, income, balance, description }
      })
  )

  const balanceString = transactions.at(-1)?.balance

  if (!balanceString) throw "Balance undefined"

  return {
    balance: format_value(balanceString),
    transactions: transactions
      .filter((transaction) => transaction.date)
      .map(({ date, expense, income, description }) => ({
        date: format_date(date),
        account: FINANCES_API_ACCOUNT_NAME,
        currency: "JPY",
        description,
        amount: income ? format_value(income) : -format_value(expense),
      })),
  }
}

export const scrape = async () => {
  console.log(`[Scraper] Scraper started`)

  // returns the content of the target transaction table
  let browser: Browser

  try {
    browser = await puppeteer.launch({
      // headless: "new",
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

  // clicking "ソフトウェアキーボードを使用して入力する" is needed for input
  await page.click("#chkUseSoftwareKeyBoard")
  await page.type("#ctl00_cphBizConf_txtLoginId", EBANKING_USERNAME)
  await page.click("#ctl00_cphBizConf_btnNext")

  await page.waitForSelector("#chkUseSoftwareKeyBoard")

  await page.click("#chkUseSoftwareKeyBoard")
  await page.type("#ctl00_cphBizConf_txtLoginPw", EBANKING_PASSWORD)
  await page.click("#ctl00_cphBizConf_btnLogin")

  await page.waitForSelector('input[name="ctl00$mmngMenu$ctl01"]')

  console.log("[Scraper] Logged in")
  console.log("[Scraper] Navigating to transactions table page...")

  await page.click('input[name="ctl00$mmngMenu$ctl01"]')
  await page.waitForSelector("#ctl00_cphBizConf_btnRefthisMon")
  await page.click("#ctl00_cphBizConf_btnRefthisMon")
  await page.waitForSelector("#ctl00_cphBizConf_gdvAcntInfo")

  console.log("[Scraper] Navigated to transactions table page")

  const { balance, transactions } = await parseTransactionsPage(page)

  await browser.close()

  return {
    balance,
    transactions,
  }
}
