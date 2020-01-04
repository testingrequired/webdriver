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
          "window-size=1920,1080",
          "headless",
          "disable-gpu",
          "disable-features=VizDisplayCompositor"
        ]
      }
    }
  });

  await driver.newSession();

  await driver.url("https://www.google.com/");

  await driver.deleteSession();
})();
