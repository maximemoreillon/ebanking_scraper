export const format_value = (value: string) => {
  const number = Number(value.replace(/,/g, "").replace("円", ""))
  if (Number.isNaN(number)) throw `Invalid amount: ${value}`
  return number
}

export const format_date = (value: string) => {
  const date = new Date(
    value.replace("年", "/").replace("月", "/").replace("日", ""),
  )
  if (Number.isNaN(date.getTime())) throw `Invalid date: ${value}`
  return date
}

type Transaction = {
  date: Date
  description?: string | null
  amount: number
}

// The finances API ignores transactions with identical time, description and amount
// so legitimate repeats (e.g. two identical withdrawals on the same day) get numbered
export const renameDuplicates = <T extends Transaction>(transactions: T[]) =>
  transactions.map((t, i) => {
    const duplicateCount = transactions
      .slice(0, i)
      .filter(
        (e) =>
          e.date.getTime() === t.date.getTime() &&
          e.description === t.description &&
          e.amount === t.amount,
      ).length

    return duplicateCount
      ? { ...t, description: `${t.description}(${duplicateCount + 1})` }
      : t
  })
