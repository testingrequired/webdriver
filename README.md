# @testingrequired/webdriver

[![Build Status](https://travis-ci.org/testingrequired/webdriver.svg?branch=master)](https://travis-ci.org/testingrequired/webdriver)

A webdriver library

## Usage

### Define Web Element

```javascript
import { WebElement } from "@testingrequired/webdriver";

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
    await (await this.username).sendKeys(username);
    await (await this.password).sendKeys(password);
    await (await this.loginButton).click();
  }
}
```

### Use In Automation

```javascript
import assert from "assert";
import { Browser, WebElement, Events } from "@testingrequired/webdriver";

(async () => {
  const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
  const timeoutsConfig = { implicit: 5000 };

  const browser = Browser.chrome(webdriverOptions, timeoutsConfig);

  await browser.session(async () => {
    await browser.go("https://exampletest.app/user");

    await (await browser.$("#loginForm", LoginForm)).login(
      "testUser",
      "password"
    );

    assert.strictEqual(await (await browser.$("h3")).text(), "Timeline");
  });
})();
```

## Note

This is not a production ready project yet. Breaking changes should be expected.

## Install

[![npm version](https://badge.fury.io/js/%40testingrequired%2Fwebdriver.svg)](https://badge.fury.io/js/%40testingrequired%2Fwebdriver)

```bash
$ npm i @testingrequired/webdriver@latest
```

## Goals

### Extendable Web Elements

All element query methods `findElement`, `$$`, etc... accept classes extending `WebElement` allowing them to be treated like page objects.

## Development

### Setup

1. Clone repo
2. `$ npm ci`
3. `$ npm run selenium -- install`

### Running

1. `$ npm run selenium -- start`
2. `$ npm start`
