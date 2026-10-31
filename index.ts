import dotenv from "dotenv"
dotenv.config()

import { version } from "./package.json"
import { logger } from "./logger"
logger.info(`E-Banking scraper v${version}`)

import { scrape } from "./scraper"
import { register_transactions, register_balance } from "./registration"

process.env.TZ = "Asia/Tokyo"

const scrape_and_register = async () => {
  const { balance, transactions } = await scrape()

  logger.info(
    { count: transactions.length, balance },
    "[Scraper] Transactions scraped",
  )

  await register_transactions(transactions)

  if (balance === undefined) {
    logger.warn("[Scraper] No transactions listed, balance not registered")
  } else {
    await register_balance(balance)
  }

  logger.info({ count: transactions.length }, "Transactions registered")
}

scrape_and_register().catch((error) => {
  logger.error({ err: error }, "Scrape and register failed")
  process.exit(1)
})
