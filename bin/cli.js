const { WebDriver } = require("../lib");

(async () => {
  const driver = new WebDriver({
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome",
      chromeOptions: {
        args: [
          "binary=/usr/bin/google-chrome-stable",
          "remote-debugging-port=9222",
          "headless",
          "disable-gpu",
          "no-sandbox",
          "disable-setuid-sandbox"
        ]
      }
    }
  });

  await driver.newSession();

  await driver.url("https://www.google.com/");

  await driver.deleteSession();
})();
