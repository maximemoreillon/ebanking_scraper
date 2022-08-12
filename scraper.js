const puppeteer = require('puppeteer')
const dotenv = require('dotenv')

dotenv.config()

const {
  EBANKING_URL,
  EBANKING_USERNAME,
  EBANKING_PASSWORD,
} = process.env


const get_transactions_from_table = async (page) => page.evaluate(() => {
  var transactions = []

  // NOTE: returns a nodelist and not an array
  var rows = document.querySelectorAll('#ctl00_cphBizConf_gdvCrdtwtdrwDtlInsp tr')
  var balance = document.getElementById("ctl00_cphBizConf_lblBal")
    .innerHTML
    .replace(/,/g, "")
    .replace(" 円", "")

  rows.forEach(row => {

    let cells = row.querySelectorAll("td")

    var extracted_row = [];
    
    cells.forEach(cell => {
      let content = cell.querySelector('span').innerHTML
      extracted_row.push(content)
    })

    transactions.push(extracted_row)

  })

  return { balance, transactions }

})

exports.scrape = async () => {

  console.log(`[Scraper] Scraper started`)


  // returns the content of the target trtansaction table
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 800 })

  // Navigate to main page
  await page.goto(EBANKING_URL)


  // Input username and click next
  await page.evaluate((EBANKING_USERNAME) => {
    document.querySelector("input[name='ctl00$cphBizConf$txtLoginId']").value = EBANKING_USERNAME
    document.querySelector("input[name='ctl00$cphBizConf$btnNext']").click()
  }, EBANKING_USERNAME)
  await page.waitForNavigation()


  // Input password and click next
  await page.evaluate((EBANKING_PASSWORD) => {
    document.querySelector('input[name="ctl00$cphBizConf$txtLoginPw"]').value = EBANKING_PASSWORD
    document.querySelector("input[name='ctl00$cphBizConf$btnLogin']").click()
  }, EBANKING_PASSWORD)
  await page.waitForNavigation()


  const {balance, transactions} = await get_transactions_from_table(page)

  await browser.close();

  return { balance, transactions }
}
