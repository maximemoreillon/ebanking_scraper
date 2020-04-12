const puppeteer = require('puppeteer');
const secrets = require('./secrets');

exports.scrape = async function(){
  // returns the content of the target trtansaction table
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 800 })

  // Navigate to main page
  await page.goto(secrets.url);

  await page.screenshot({path: './screenshots/initial.png'});

  // Input ID
  console.log(`[Scraper] Submitting ID`)
  page.evaluate((secrets) => {
    document.querySelector("input[name='ctl00$cphBizConf$txtLoginId']").value = secrets.username;
    document.querySelector("input[name='ctl00$cphBizConf$btnNext']").click();
  }, secrets);
  await page.waitForNavigation();

  await page.screenshot({path: './screenshots/username_input.png'});

  // Login
  console.log(`[Scraper] Submitting password`)
  page.evaluate((secrets) => {
    document.querySelector('input[name="ctl00$cphBizConf$txtLoginPw"]').value = secrets.password;
    document.querySelector("input[name='ctl00$cphBizConf$btnLogin']").click();
  }, secrets);
  await page.waitForNavigation();


  // Click "change password later" button
  console.log(`[Scraper] Clicking 'Not changing password'`)
  page.evaluate(() => {
    document.querySelector("input[name='ctl00$cphBizConf$btnNoChg']").click();
  })
  .then( async () => {await page.waitForNavigation()} )
  .catch( error => console.log(`[Scraper] failed to click 'not changing password'`))



  await page.screenshot({path: './screenshots/logged_in.png'});




  var table_content = await page.evaluate(() => {
    var table_content = [];

    // Note: returns a nodelist and not an array
    var rows = document.querySelectorAll('#ctl00_cphBizConf_gdvCrdtwtdrwDtlInsp tr')
    var balance = document.getElementById("ctl00_cphBizConf_lblBal").innerHTML.replace(/,/g,"").replace(" 円","");

    rows.forEach( row => {

      let cells = row.querySelectorAll("td");

      var extracted_row = [];
      cells.forEach(cell => {
        let content = cell.querySelector('span').innerHTML
        extracted_row.push(content)
      });

      table_content.push(extracted_row)


    });




   return {
     balance: balance,
     transactions: table_content
   }
   
  });

  await browser.close();

  return table_content
}
