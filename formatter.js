const secrets = require('./secrets')

function format_value(value){
  return Number(value.replace(/,/g,"").replace("円",""));
}

exports.format_entries = function(table){

  var entries = []

  for (row of table) {
    // Check format
    if(row.length === 5){
      var entry = {
        date : new Date( row[0].replace("年","/").replace("月","/").replace("日","") ),
        description : row[4],
        account: secrets.account_name,
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
