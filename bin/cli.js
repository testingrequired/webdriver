import assert from "assert";
import { Browser, WebElement } from "../lib";

(async () => {
  const webdriverOptions = {
    remoteUrl: "http://localhost:4444/wd/hub"
  };
  const timeoutsConfig = { implicit: 5000 };

  debugger;

  await Browser.chrome(
    webdriverOptions,
    timeoutsConfig,
    registerOutputHandlers
  ).session(async browser => {
    await browser.go("https://exampletest.app/user");

    const loginForm = await browser.$("#loginForm", LoginForm);

    await loginForm.fillAndSubmit("testUser", "password");

    const h3 = await browser.$("h3");

    assert.strictEqual(await h3.text(), "Timeline");
  });
})();

function registerOutputHandlers(driver) {
  driver.on("command", (url, method, body) => {
    console.log(
      [method, url, ...(body ? [JSON.stringify(body)] : [])].join(": ")
    );
  });

  driver.on("command:success", body => {
    console.log(`DATA: ${JSON.stringify(body)}`);
  });
}

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

  async fillAndSubmit(username, password) {
    await (await this.username).sendKeys(username);
    await (await this.password).sendKeys(password);
    await (await this.loginButton).click();
  }
}
