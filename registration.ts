import axios from "axios";

export const { FINANCES_API_URL, FINANCES_API_TOKEN, FINANCES_API_ACCOUNT_ID } =
  process.env;

const options = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FINANCES_API_TOKEN}`,
  },
  timeout: 3000,
};

export const register_transactions = async (transactions: any) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_ID}/transactions`;

  for (const { date, description, amount } of transactions) {
    const body = { time: date, description, amount };
    await axios.post(url, body, options);
  }
};

export const register_balance = (balance: number) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_ID}/balance`;

  const body = {
    balance,
    currency: "JPY",
  };

  return axios.post(url, body, options);
};
