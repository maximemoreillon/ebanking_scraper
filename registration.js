const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const {
  FINANCES_API_URL,
  FINANCES_API_TOKEN,
  FINANCES_API_ACCOUNT_NAME
} = process.env

const options = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FINANCES_API_TOKEN}`,
  },
  timeout: 3000,
}

exports.register_transactions = (transactions) => {

  const url = `${FINANCES_API_URL}/transactions`
  // Note: Account is written in the transactions
  const body = {transactions}

  axios.post(url, body, options)
  .then( () => {
    console.log('[Transactions] Balance registered successfully')
  })
  .catch(error => {
    console.log(error)
  })
}

exports.register_balance = (balance) => {

  const url = `${FINANCES_API_URL}/balance`
  const body = {
    balance,
    currency: "JPY",
    account: FINANCES_API_ACCOUNT_NAME,
  }

  axios.post(url, body,options)
  .then( () => {
    console.log('[Balance] Balance registered successfully')
  })
  .catch(error => {
    console.log(error)
  })
}
