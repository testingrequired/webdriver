# @testingrequired/webdriver

[![Build Status](https://travis-ci.org/testingrequired/webdriver.svg?branch=master)](https://travis-ci.org/testingrequired/webdriver)

A webdriver library

## Note

This is not a production ready project yet. Breaking changes should be expected.

## Install

[![npm version](https://badge.fury.io/js/%40testingrequired%2Fwebdriver.svg)](https://badge.fury.io/js/%40testingrequired%2Fwebdriver)

```bash
$ npm i @testingrequired/webdriver@latest
```

## Usage

```javascript
import assert from "assert";
import { Browser, WebElement } from "@testingrequired/webdriver";

(async () => {
  const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
  const timeoutsConfig = { implicit: 5000 };

  await Browser.chrome(webdriverOptions, timeoutsConfig).session(
    async browser => {
      await browser.go("https://exampletest.app/user");

      const loginForm = await browser.$("#loginForm", LoginForm);

      await loginForm.fillAndSubmit("testUser", "password");

      const h3 = await browser.$("h3");

      assert.strictEqual(await h3.text(), "Timeline");
    }
  );
})();

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
```

## Why?

There are plenty of solutions out there: webdriver.io, selenium-webdriver, cypress. All of them had aspects of their APIs that created friction. This aims to address those issues and implement new features on top of the webdriver spec.

### Goals

#### ES6 Promises

Use standard promises for asynchronous actions.

#### First Class Page Objects

All element query methods `findElement`, `$$`, etc... accept classes extending `WebElement` allowing them to be treated like page objects.

## Development

### Setup

1. Clone repo
2. `$ npm ci`
3. `$ npm run selenium -- install`

### Running

1. `$ npm run selenium -- start`
2. `$ npm start`
