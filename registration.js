const axios = require('axios')
const jwt = require('jsonwebtoken')

const secrets = require('./secrets')

exports.register_transactions = (transactions) => {
  axios.post(secrets.transactions_registration_api_url, {
    transactions: transactions,
  },{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secrets.jwt}`,
    },
    timeout: 3000,
  })
  .then(response => console.log(response.data))
  .catch(error => {
    console.log(error)
  })
}

exports.register_balance = (balance) => {
  axios.post(secrets.balance_registration_api_url, {
    balance: balance,
    currency: "JPY",
    account: secrets.account_name,
  },{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secrets.jwt}`,
    },
    timeout: 3000,
  })
  .then(response => console.log(response.data))
  .catch(error => {
    console.log(error)
  })
}
