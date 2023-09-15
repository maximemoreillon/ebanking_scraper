import dotenv from "dotenv"
dotenv.config()

const { FINANCES_API_ACCOUNT_NAME } = process.env

const format_value = (value: string) =>
  Number(value.replace(/,/g, "").replace("円", ""))

const format_date = (value: string) =>
  new Date(value.replace("年", "/").replace("月", "/").replace("日", ""))

export const format_entries = (table: string) => {
  var entries = []

  for (let row of table) {
    // Check format
    if (row.length === 5) {
      var entry: any = {
        date: format_date(row[0]),
        description: row[4],
        account: FINANCES_API_ACCOUNT_NAME,
        currency: "JPY",
      }

      // Check if value was an income or an expense
      if (format_value(row[1]) === 0) entry.amount = format_value(row[2])
      else entry.amount = -format_value(row[1])

      entries.push(entry)
    }
  }

  return entries
}
