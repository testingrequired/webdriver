const { Browser, By } = require("../lib");

(async () => {
  const capabilities = {
    remoteUrl: "http://localhost:4444/wd/hub",
    desiredCapabilities: {
      browserName: "chrome"
    }
  };

  await Browser.build(capabilities).session(async browser => {
    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    console.log(header.elementId);

    const header2 = await browser.$x("//html");

    console.log(header2.elementId);
  });
})();
