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

const scrapeBalance = async (page: Page) => {
  const balanceContainer: any = await page.$("#ctl00_cphBizConf_lblBal")
  const balanceString: string = await (
    await balanceContainer.getProperty("textContent")
  ).jsonValue()
  const balanceStringFormatted = balanceString
    .replace(/,/g, "")
    .replace(" 円", "")

  return Number(balanceStringFormatted)
}

const get_transactions_from_table = async (page: Page) =>
  await page.$$eval("#ctl00_cphBizConf_gdvAcntInfo tr", (rows) =>
    rows
      .map((row) => {
        const [date, expense, income, balance, description] = Array.from(
          row.querySelectorAll("td")
        ).reduce((acc: any, cell) => {
          const textContent = cell.textContent
          return [...acc, textContent?.trim()]
        }, [])

        const transaction = { date, expense, income, balance, description }
        return transaction
      })
      .filter((transaction) => transaction.date)
  )

export const scrape = async () => {
  console.log(`[Scraper] Scraper started`)

  // returns the content of the target transaction table
  let browser: Browser

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  } catch {
    browser = await puppeteer.launch({ headless: "new" })
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(EBANKING_URL)

  // clicking "ソフトウェアキーボードを使用して入力する" is needed for input
  await page.click("#chkUseSoftwareKeyBoard")
  await page.type("#ctl00_cphBizConf_txtLoginId", EBANKING_USERNAME)
  await page.click("#ctl00_cphBizConf_btnNext")

  try {
    await page.waitForNavigation()
  } catch (error) {}

  await page.click("#chkUseSoftwareKeyBoard")
  await page.type("#ctl00_cphBizConf_txtLoginPw", EBANKING_PASSWORD)
  await page.click("#ctl00_cphBizConf_btnLogin")

  console.log("[Scraper] Waiting for login...")

  try {
    await page.waitForNavigation()
  } catch (error) {}

  console.log("[Scraper] Logged in")

  console.log("[Scraper] Scraping balance...")
  const balance = await scrapeBalance(page)

  console.log(`[Scraper] Scraped balance : ${balance}`)

  await page.click("#ctl00_cphBizConf_lnkSeeBfrCrdt")
  try {
    await page.waitForNavigation()
  } catch (error) {}

  const transactions = await get_transactions_from_table(page)

  await browser.close()

  return {
    balance,
    transactions: transactions.map(({ date, expense, income, description }) => {
      return {
        date: format_date(date),
        account: FINANCES_API_ACCOUNT_NAME,
        currency: "JPY",
        description,
        amount: income ? format_value(income) : -format_value(expense),
      }
    }),
  }
}
