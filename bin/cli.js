const assert = require("assert");
const { Browser, sleep, WebElement } = require("../lib");

class LoginForm extends WebElement {
  get username() {
    return this.$("#username");
  }

  get password() {
    return this.$("#password");
  }

  async fill(username, password) {
    await (await this.username).sendKeys(username);
    await (await this.password).sendKeys(password);
  }
}

(async () => {
  const remoteUrl = "http://localhost:4444/wd/hub";

  await Browser.chrome({ remoteUrl }).session(async browser => {
    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    await browser.driver.executeFunction(function() {
      console.log(`Hello ${arguments[0]}`);
    }, "World");

    const header2 = await browser.$x("//html");

    assert.strictEqual(header.elementId, header2.elementId);

    browser.driver.executeFunction(function() {
      document.querySelector("#userLink").click();
    });

    await sleep(5000);

    /**
     * @type {LoginForm}
     */
    const loginForm = await browser.$("#loginForm", LoginForm);

    await loginForm.fill("testUser", "password");
  });
})();
