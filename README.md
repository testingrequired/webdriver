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
    await this.username.then(($) => $.sendKeys(username));
    await this.password.then(($) => $.sendKeys(password));
    await this.loginButton.then(($) => $.click());
  }
}
```

### Use In Automation

```javascript
import assert from "assert";
import { Browser, WebElement, Events } from "@testingrequired/webdriver";

const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
const timeoutsConfig = { implicit: 5000 };

Browser.chrome(webdriverOptions, timeoutsConfig).session(async (browser) => {
  await browser.go("https://exampletest.app/user");

  await browser
    .$("#loginForm", LoginForm)
    .then((loginForm) => loginForm.login("testUser", "password"));

  assert.strictEqual(await browser.$("h3").then((h3) => h3.text()), "Timeline");
});
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
