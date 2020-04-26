import assert from "assert";
import { Browser, WebElement } from "../lib";

(async () => {
  const webdriverOptions = {
    remoteUrl: "http://localhost:4444/wd/hub",
  };
  const timeoutsConfig = { implicit: 5000 };

  debugger;

  await Browser.chrome(
    webdriverOptions,
    timeoutsConfig,
    registerOutputHandlers
  ).session(async (browser) => {
    await browser.go("https://exampletest.app/user");

    const loginForm = await browser.$("#loginForm", LoginForm);

    await loginForm.fillAndSubmit("testUser", "password");

    const h3 = await browser.$("h3");

    assert.strictEqual(await h3.text(), "Timeline");
  });
})();

function registerOutputHandlers(driver) {
  driver.on("sessionStart", (capabilities) => {
    console.log(
      `Session initiated with capabilities: ${JSON.stringify(capabilities)}`
    );
  });

  driver.on("sessionStart:success", (sessionId) => {
    console.log(`Session started. Session Id: ${sessionId}`);
  });

  driver.on("sessionEnd", (sessionId) => {
    console.log(`Session ended. Session Id: ${sessionId}`);
  });

  driver.on("command", (requestId, { endpoint, method, body }) => {
    console.log(`COMMAND (${requestId}): ${method} ${endpoint}`);

    if (body) {
      console.log(`REQ: ${JSON.stringify(body)}`);
    }
  });

  driver.on("command:success", (requestId, command, body) => {
    console.log(`RES     (${requestId}): ${JSON.stringify(body)}`);
  });

  driver.on("command:fail", (requestId, command, error) => {
    console.log(`ERROR  (${requestId}): ${error.message}`);
  });

  driver.on("command:end", () => {
    console.log(`---`);
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
