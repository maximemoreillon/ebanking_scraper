import dotenv from "dotenv"
dotenv.config()

import { scrape } from "./scraper"
import { version } from "./package.json"
import { register_transactions, register_balance } from "./registration"
import { logger } from "./logger"

process.env.TZ = "Asia/Tokyo"

console.log(`E-Banking scraper v${version}`)

const scrape_and_register = async () => {
  try {
    const { balance, transactions }: any = await scrape()

    console.log(`[Scraper] Scraped ${transactions.length} transactions`)
    console.log(`[Scraper] Balance: ${balance}`)

    await register_transactions(transactions)
    await register_balance(balance)

    logger.info({
      message: `Successfully registered balance and ${transactions.length} transactions`,
    })
  } catch (error) {
    logger.error({
      message: `Scraping failed`,
    })
    throw error
  } finally {
    logger.close()
  }
}

scrape_and_register()
