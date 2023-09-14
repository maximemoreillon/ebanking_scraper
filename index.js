const { format_entries } = require("./formatter")
const { scrape } = require("./scraper")
const { version } = require("./package.json")
const dotenv = require("dotenv")
const { register_transactions, register_balance } = require("./registration")

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`E-Banking scraper v${version}`)

const scrape_and_register = async () => {
  const { balance, transactions } = await scrape()
  const formatted_transactions = format_entries(transactions)

  console.log(
    `[Scraper] Scraped ${formatted_transactions.length} transactions, last one being ${formatted_transactions[0].description}`
  )
  console.log(`[Scraper] Balance: ${balance}`)

  register_transactions(formatted_transactions)
  register_balance(balance)
}

scrape_and_register()
