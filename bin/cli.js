const { WebDriver, Browser } = require("../lib");

(async () => {
  const driver = new WebDriver({
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome"
    }
  });

  await driver.newSession();

  await driver.url("https://www.google.com/");

  await driver.closeWindow();

  await driver.deleteSession();
})();
