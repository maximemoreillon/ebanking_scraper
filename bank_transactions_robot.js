const schedule = require ('node-schedule');
const scraper = require('./scraper')
const registration = require('./registration')
const formatter = require('./formatter')

process.env.TZ = 'Asia/Tokyo';

// scrape periodically
schedule.scheduleJob('0 2 * * *', () => {
  scraper.scrape().then(result => {
    let formatted_transactions = formatter.format_entries(result.transactions)
    registration.register_transactions(formatted_transactions)
    registration.register_balance(result.balance)
  })
});

console.log("Dry run for testing purposes")
scraper.scrape().then(result => {

  let formatted_transactions = formatter.format_entries(result.transactions)

  console.log(`Scraped ${formatted_transactions.length} transactions, last one being ${formatted_transactions[0].description}`)
  console.log(`Balance: ${result.balance}`)

  registration.register_transactions(formatted_transactions)
  registration.register_balance(result.balance)

})
