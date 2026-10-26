import dotenv from "dotenv"
dotenv.config()

import { version } from "./package.json"
console.log(`E-Banking scraper v${version}`)

import { scrape } from "./scraper"
import { register_transactions, register_balance } from "./registration"

process.env.TZ = "Asia/Tokyo"

const scrape_and_register = async () => {
  const { balance, transactions } = await scrape()

  console.log(`[Scraper] Scraped ${transactions.length} transactions`)
  console.log(`[Scraper] Balance: ${balance}`)

  await register_transactions(transactions)

  if (balance === undefined) {
    console.log(`[Scraper] No transactions listed, balance not registered`)
  } else {
    await register_balance(balance)
  }

  console.log(`Successfully registered ${transactions.length} transactions`)
}

scrape_and_register()
