const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()

const { FINANCES_API_URL, FINANCES_API_TOKEN, FINANCES_API_ACCOUNT_NAME } =
  process.env

const options = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FINANCES_API_TOKEN}`,
  },
  timeout: 3000,
}

export const register_transactions = (transactions: any) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/transactions`
  // Note: Account is written in the transactions
  const body = { transactions }

  return axios.post(url, body, options)
}

export const register_balance = (balance: number) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/balance`

  const body = {
    balance,
    currency: "JPY",
  }

  return axios.post(url, body, options)
}

export const finance_api_url = FINANCES_API_URL
export const finance_api_account = FINANCES_API_ACCOUNT_NAME
