const assert = require("assert");
const { Browser, WebElement, sleep } = require("../lib");

class LoginForm extends WebElement {
  get username() {
    return this.$("#username");
  }

  get password() {
    return this.$("#password");
  }

  get loginButton() {
    return this.$("#loginButton");
  }

  async fill(username, password) {
    await (await this.username).sendKeys(username);
    await (await this.password).sendKeys(password);
    await (await this.loginButton).click();
  }
}

(async () => {
  const remoteUrl = "http://localhost:4444/wd/hub";

  await Browser.chrome({ remoteUrl }).session(async browser => {
    await browser.go("https://exampletest.app/user");

    await sleep(5000);

    const loginForm = await browser.$("#loginForm", LoginForm);

    await loginForm.fill("testUser", "password");

    await sleep(5000);

    const h3 = await browser.$("h3");
    const h3Text = await h3.text();

    assert.strictEqual(h3Text, "Timeline");
  });
})();
