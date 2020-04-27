import assert from "assert";
import { Browser, WebElement, cliReporter } from "../lib";

const webdriverOptions = {
  remoteUrl: "http://localhost:4444/wd/hub",
};
const timeoutsConfig = { implicit: 5000 };

const browser = Browser.chrome(webdriverOptions, timeoutsConfig, cliReporter);

browser.session(async (browser) => {
  await browser.go("https://exampletest.app/user");

  await browser
    .$("#loginForm", LoginForm)
    .then((loginForm) => loginForm.login("testUser", "password"));

  assert.strictEqual(await browser.$("h3").then((h3) => h3.text()), "Timeline");
});

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

  async login(username, password) {
    await this.username.then(($) => $.sendKeys(username));
    await this.password.then(($) => $.sendKeys(password));
    await this.loginButton.then(($) => $.click());
  }
}
