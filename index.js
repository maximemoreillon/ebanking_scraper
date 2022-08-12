const { scheduleJob } = require ('node-schedule');
const { register_transactions, register_balance } = require('./registration')
const { format_entries } = require('./formatter')
const { scrape } = require('./scraper')

process.env.TZ = 'Asia/Tokyo'

const scrape_and_register = () => {
  scrape().then( ({balance, transactions}) => {

    let formatted_transactions = format_entries(transactions)

    console.log(`[Scraper] Scraped ${formatted_transactions.length} transactions, last one being ${formatted_transactions[0].description}`)
    console.log(`[Scraper] Balance: ${balance}`)

    register_transactions(formatted_transactions)
    register_balance(balance)

  })
}

// scrape periodically
scheduleJob('0 2 * * *', scrape_and_register)

// Scrape immediatly upon running script
scrape_and_register()