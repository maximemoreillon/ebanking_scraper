import dotenv from "dotenv"
dotenv.config()

import { version } from "./package.json"
console.log(`E-Banking scraper v${version}`)

import { scrape } from "./scraper"
import { register_transactions, register_balance } from "./registration"

process.env.TZ = "Asia/Tokyo"

const scrape_and_register = async () => {
  try {
    const { balance, transactions }: any = await scrape()

    console.log(`[Scraper] Scraped ${transactions.length} transactions`)
    console.log(`[Scraper] Balance: ${balance}`)

    await register_transactions(transactions)
    await register_balance(balance)

    console.log(`Successfully registered balance and ${transactions.length} transactions`)
  } catch (error) {
    console.error(`Scraping failed`)
    throw error
  }
}

scrape_and_register()
