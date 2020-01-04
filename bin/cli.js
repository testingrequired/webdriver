const { Browser } = require("../lib");

(async () => {
  const remoteUrl = "http://localhost:4444/wd/hub";

  await Browser.chrome({ remoteUrl }).session(async browser => {
    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    console.log(header.elementId);

    const header2 = await browser.$x("//html");

    console.log(header2.elementId);
  });
})();
