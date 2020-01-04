const { WebDriver, Browser } = require("../lib");

(async () => {
  const driver = new WebDriver({
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome"
    }
  });

  const browser = new Browser(driver);

  await browser.driver.newSession();

  await browser.go("https://www.google.com/");

  await browser.close();

  await browser.driver.deleteSession();
})();
