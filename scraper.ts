import puppeteer, { Page, Browser } from "puppeteer"
import { sleep } from "./utils"
import dotenv from "dotenv"

dotenv.config()

const {
  EBANKING_URL = "",
  EBANKING_USERNAME = "",
  EBANKING_PASSWORD = "",
} = process.env

const get_transactions_from_table = async (page: Page) =>
  page.evaluate(() => {
    var transactions: any[] = []

    // NOTE: returns a nodelist and not an array
    var rows = document.querySelectorAll(
      "#ctl00_cphBizConf_gdvCrdtwtdrwDtlInsp tr"
    )

    // @ts-ignore
    var balance = document
      .getElementById("ctl00_cphBizConf_lblBal")
      .innerHTML.replace(/,/g, "")
      .replace(" 円", "")

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

    return { balance, transactions }
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
  } catch (error) {
    console.warn("Waiting for navigation failed")
  }

  await page.click("#chkUseSoftwareKeyBoard")
  await page.type("#ctl00_cphBizConf_txtLoginPw", EBANKING_PASSWORD)
  await page.click("#ctl00_cphBizConf_btnLogin")

  try {
    await page.waitForNavigation()
  } catch (error) {
    console.warn("Waiting for navigation failed")
  }

  console.log("[Scraper] Logged in")

  const { balance, transactions } = await get_transactions_from_table(page)

  await browser.close()

  return { balance, transactions }
}
