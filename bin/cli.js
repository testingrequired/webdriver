const { Browser, By } = require("../lib");

(async () => {
  const browser = Browser.build({
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome"
    }
  });

  try {
    await browser.driver.newSession();

    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    console.log(header.elementId);

    const header2 = await browser.$x("//html");

    console.log(header2.elementId);
  } finally {
    await browser.close();

    await browser.driver.deleteSession();
  }
})();
