import puppeteer, { Page, Browser } from "puppeteer"
import dotenv from "dotenv"

dotenv.config()

const {
  EBANKING_URL = "",
  EBANKING_USERNAME = "",
  EBANKING_PASSWORD = "",
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
  page.evaluate(() => {
    var transactions: any[] = []

    // NOTE: returns a nodelist and not an array
    var rows = document.querySelectorAll(
      "#ctl00_cphBizConf_gdvCrdtwtdrwDtlInsp tr"
    )

    rows.forEach((row) => {
      let cells = row.querySelectorAll("td")

      var extracted_row: any[] = []

      cells.forEach((cell) => {
        // @ts-ignore
        let content = cell.querySelector("span").innerHTML
        extracted_row.push(content)
      })

      transactions.push(extracted_row)
    })

    return transactions
  })

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

  const balance = await scrapeBalance(page)
  const transactions = await get_transactions_from_table(page)

  await browser.close()

  return { balance, transactions }
}
