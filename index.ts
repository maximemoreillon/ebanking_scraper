import { format_entries } from "./formatter"
import { scrape } from "./scraper"
import { version } from "./package.json"
import dotenv from "dotenv"
import { register_transactions, register_balance } from "./registration"
import { logger } from "./logger"

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`E-Banking scraper v${version}`)

const scrape_and_register = async () => {
  try {
    const { balance, transactions }: any = await scrape()
    const formatted_transactions = format_entries(transactions)

    console.log(
      `[Scraper] Scraped ${formatted_transactions.length} transactions`
    )
    console.log(`[Scraper] Balance: ${balance}`)

    await register_transactions(formatted_transactions)
    await register_balance(balance)

    logger.info({
      message: `Successfully scraped balance and ${formatted_transactions.length} transactions`,
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
