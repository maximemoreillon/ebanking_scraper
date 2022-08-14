const { scheduleJob } = require ('node-schedule');
const { 
  register_transactions, 
  register_balance,
  finance_api_url,
  finance_api_account,
} = require('./registration')
const { format_entries } = require('./formatter')
const { scrape } = require('./scraper')
const { version } = require('./package.json')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')


dotenv.config()

const {
  PORT = 80
} = process.env

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send({
    application_name: 'eBanking scraper',
    version,
    finances_api: {
      url: finance_api_url,
      account: finance_api_account,
    }
  })
})

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`)
})



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