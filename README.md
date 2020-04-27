# @testingrequired/webdriver

[![Build Status](https://travis-ci.org/testingrequired/webdriver.svg?branch=master)](https://travis-ci.org/testingrequired/webdriver)

A webdriver library

## Usage

### Initialize Browser

Use the `Browser.chrome` method to initialize a Chrome `Browser` instance (support for other browsers coming).

```javascript
import assert from "assert";
import { Browser, WebElement, Events } from "@testingrequired/webdriver";

const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
const timeoutsConfig = { implicit: 5000 };

const browser = Browser.chrome(webdriverOptions, timeoutsConfig);
```

### Create WebDriver Session

The `.session` method will create a new webdriver session, execute the callback then end the webdriver session. The `browser.go` method will navigate to the url and returns a promise. Nearly all methods are async.

```javascript
import assert from "assert";
import { Browser, WebElement, Events } from "@testingrequired/webdriver";

const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
const timeoutsConfig = { implicit: 5000 };

const browser = Browser.chrome(webdriverOptions, timeoutsConfig);

browser.session(async () => {
  await browser.go("https://exampletest.app/user");
});
```

### Page Objects

Page objects are a common pattern with webdriver automation and they are a first class concept in the form of `WebElement`. The `WebElement` class can be extended and treated like a page object. These extended classes can be passed to element query methods and results will be instances of that extended class.

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

Element query methods will automatically scope results to the current `WebElement` instance versus the entire page.

### Use

```javascript
import assert from "assert";
import { Browser, WebElement, Events } from "@testingrequired/webdriver";

const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
const timeoutsConfig = { implicit: 5000 };

const browser = Browser.chrome(webdriverOptions, timeoutsConfig);

browser.session(async () => {
  await browser.go("https://exampletest.app/user");

  // Query for the login form and apply the LoginForm class
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

### Timeline

Get a timeline DOM and screenshots for easier debugging.

## Development

### Setup

1. Clone repo
2. `$ npm ci`
3. `$ npm run selenium -- install`

### Running

1. `$ npm run selenium -- start`
2. `$ npm start`
