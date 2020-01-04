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

    const header = await browser.findElement(new By("css selector", "html"));

    console.log(header.elementId);
  } finally {
    await browser.close();

    await browser.driver.deleteSession();
  }
})();
