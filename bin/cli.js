const assert = require("assert");
const { Browser } = require("../lib");

(async () => {
  const remoteUrl = "http://localhost:4444/wd/hub";

  await Browser.chrome({ remoteUrl }).session(async browser => {
    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    await browser.driver.executeScriptSync(function alertTest() {
      alert("TEST");
    });

    const header2 = await browser.$x("//html");

    assert.strictEqual(header.elementId, header2.elementId);
  });
})();
