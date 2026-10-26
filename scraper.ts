import puppeteer, { Page } from "puppeteer";
import { format_date, format_value, renameDuplicates } from "./formatter";

const {
  EBANKING_URL = "https://ib.resonabank.co.jp/web/0102/0102_010_00",
  EBANKING_USERNAME = "",
  EBANKING_PASSWORD = "",
  FINANCES_API_ACCOUNT_NAME,
} = process.env;

const parseTransactionsPage = async (page: Page) => {
  const transactions = await page.$$eval(
    ".account-activity-table__body__tr",
    (rows) =>
      rows.map((row) => {
        const date = row.querySelector(
          ".account-activity-table__td--date",
        )?.textContent;
        const description = row.querySelector(
          ".account-activity-table__td--name",
        )?.textContent;
        const amount = row.querySelector(
          ".account-activity-table__td--activity",
        )?.textContent;
        const balance = row.querySelector(
          ".account-activity-table__td--balance",
        )?.textContent;

        if (!date) throw "Missing date";
        if (!amount) throw "Missing amount";

        return {
          date,
          amount,
          balance,
          description,
        };
      }),
  );

  // The balance is only shown per transaction, so it is unknown when the table is empty
  const balanceString = transactions.at(-1)?.balance;

  return {
    balance: balanceString ? format_value(balanceString) : undefined,
    transactions: renameDuplicates(
      transactions
        .filter((transaction) => transaction.date)
        .map(({ date, amount, description }) => ({
          date: format_date(date),
          account: FINANCES_API_ACCOUNT_NAME,
          currency: "JPY",
          description,
          amount: format_value(amount),
        })),
    ),
  };
};

export const scrape = async () => {
  console.log(`[Scraper] Scraper started`);

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36";

  // The container runs as root, which Chrome only allows without its sandbox
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(EBANKING_URL);

  await page.waitForSelector("#loginId");

  console.log("[Scraper] Logging in...");

  await page.type("#loginId", EBANKING_USERNAME);
  await page.keyboard.press("Enter");
  await page.waitForSelector("#loginPassword");
  await page.type("#loginPassword", EBANKING_PASSWORD);
  await page.keyboard.press("Enter");

  await page.waitForSelector(
    ".global-navigation__inner__item__second-menu__item__link",
  );

  // TODO: ignore password change

  console.log("[Scraper] Logged in");
  console.log("[Scraper] Navigating to transactions table page...");

  const menu = await page.$(".home-menu__list");
  const menuItems = await menu?.$$("li");
  if (!menuItems) throw "Home page menu items not found";
  const link = await menuItems[0].$("a");
  if (!link) throw "Link to transactions table not found";
  // Wait for navigation concurrently with the click so a fast page load is not missed
  await Promise.all([page.waitForNavigation(), link.click()]);

  console.log("[Scraper] Navigated to transactions table page");

  const { balance, transactions } = await parseTransactionsPage(page);

  await browser.close();

  return {
    balance,
    transactions,
  };
};
