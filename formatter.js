const dotenv = require('dotenv')
dotenv.config()


const {
  FINANCES_API_ACCOUNT_NAME
} = process.env


const format_value = (value) => Number(value.replace(/,/g,"").replace("円",""));

const  format_date = (value) => new Date( value.replace("年","/").replace("月","/").replace("日","") )

exports.format_entries = (table) => {

  var entries = []

  for (row of table) {
    // Check format
    if(row.length === 5){
      var entry = {
        date : format_date(row[0]),
        description : row[4],
        account: FINANCES_API_ACCOUNT_NAME,
        currency: 'JPY',
      }

      // Check if value was an income or an expense
      if(format_value(row[1]) === 0) entry.amount = format_value(row[2]);
      else entry.amount = -format_value(row[1]);

      entries.push(entry);
    }


  }

  return entries;
}
