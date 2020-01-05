# @testingrequired/webdriver

A webdriver library

## Note

This is not a production ready project yet. Breaking changes should be expected.

## Usage

```javascript
const assert = require("assert");
const { Browser, WebElement } = require("../lib");

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

  await Browser.chrome({ remoteUrl }, { implicit: 5000 }).session(
    async browser => {
      await browser.go("https://exampletest.app/user");

      const loginForm = await browser.$("#loginForm", LoginForm);

      await loginForm.fill("testUser", "password");

      const h3 = await browser.$("h3");

      assert.strictEqual(await h3.text(), "Timeline");
    }
  );
})();
```

## Goals

- Use real promises
- First class page objects

## Development

### Setup

1. Clone repo
2. `$ npm ci`
3. `$ npm run selenium -- install`

### Running

1. `$ npm run selenium -- start`
2. `$ npm start`
