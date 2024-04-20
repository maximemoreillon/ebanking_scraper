export const format_value = (value: string) =>
  Number(value.replace(/,/g, "").replace("円", ""))

export const format_date = (value: string) =>
  new Date(value.replace("年", "/").replace("月", "/").replace("日", ""))
