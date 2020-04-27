import assert from "assert";
import { Browser, WebElement, Events } from "../lib";

const requestIdLength = 4;

const webdriverOptions = {
  remoteUrl: "http://localhost:4444/wd/hub",
};
const timeoutsConfig = { implicit: 5000 };

const browser = Browser.chrome(
  webdriverOptions,
  timeoutsConfig,
  registerOutputHandlers
);

browser.session(async (browser) => {
  await browser.go("https://exampletest.app/user");

  await browser
    .$("#loginForm", LoginForm)
    .then((loginForm) => loginForm.login("testUser", "password"));

  assert.strictEqual(await browser.$("h3").then((h3) => h3.text()), "Timeline");
});

function registerOutputHandlers(driver) {
  driver.on(Events.Session, (capabilities) => {
    console.log(
      `Session initiated with capabilities: ${JSON.stringify(capabilities)}`
    );
  });

  driver.on(Events.SessionSuccess, (sessionId) => {
    console.log(`SESSION: ${sessionId}`);
  });

  driver.on(Events.SessionEnd, (sessionId) => {
    console.log(`SESSION END: ${sessionId}`);
  });

  driver.on(Events.Command, (requestId, { endpoint, method, body }) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `COMMAND (${requestIdHash}): ${method} ${endpoint}`;
    const logBody = body ? `REQ: ${JSON.stringify(body)}` : "";

    console.log(log, logBody);
  });

  driver.on(Events.CommandSuccess, (requestId, command, body) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `DATA    (${requestIdHash}): ${JSON.stringify(body)}`;

    console.log(log);
  });

  driver.on(Events.CommandFail, (requestId, command, error) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `ERROR   (${requestIdHash}): ${error.message}`;

    console.log(log);
  });

  driver.on(Events.CommandEnd, (requestId) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `END     (${requestIdHash})`;

    console.log(log);
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

  async login(username, password) {
    await this.username.then(($) => $.sendKeys(username));
    await this.password.then(($) => $.sendKeys(password));
    await this.loginButton.then(($) => $.click());
  }
}
