const { WebDriver, Browser } = require("../lib");

(async () => {
  const browser = Browser.build({
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome"
    }
  });

  await browser.driver.newSession();

  await browser.go("https://www.google.com/");

  await browser.close();

  await browser.driver.deleteSession();
})();
