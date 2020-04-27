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

### Output

```javascript
import assert from "assert";
import {
  Browser,
  WebElement,
  Events,
  cliReporter, // Import the cliReporter
} from "@testingrequired/webdriver";

const webdriverOptions = { remoteUrl: "http://localhost:4444/wd/hub" };
const timeoutsConfig = { implicit: 5000 };

// Register the cliReporter
const browser = Browser.chrome(webdriverOptions, timeoutsConfig, cliReporter);

browser.session(async () => {
  await browser.go("https://exampletest.app/user");

  await browser
    .$("#loginForm", LoginForm)
    .then((loginForm) => loginForm.login("testUser", "password"));

  assert.strictEqual(await browser.$("h3").then((h3) => h3.text()), "Timeline");
});
```

#### Example Output

```bash
Session initiated with capabilities: {"browserName":"chrome"}
COMMAND (3543): POST /session REQ: {"desiredCapabilities":{"browserName":"chrome"}}
DATA    (3543): {"status":0,"sessionId":"76336ae84fc897fb7abd5272b23fea14","value":{"acceptInsecureCerts":false,"acceptSslCerts":false,"applicationCacheEnabled":false,"browserConnectionEnabled":false,"browserName":"chrome","chrome":{"chromedriverVersion":"2.43.600210 (68dcf5eebde37173d4027fa8635e332711d2874a)","userDataDir":"..."},"cssSelectorsEnabled":true,"databaseEnabled":false,"goog:chromeOptions":{"debuggerAddress":"localhost:60726"},"handlesAlerts":true,"hasTouchScreen":false,"javascriptEnabled":true,"locationContextEnabled":true,"mobileEmulationEnabled":false,"nativeEvents":true,"networkConnectionEnabled":false,"pageLoadStrategy":"normal","platform":"Windows NT","rotatable":false,"setWindowRect":true,"takesHeapSnapshot":true,"takesScreenshot":true,"unexpectedAlertBehaviour":"","version":"81.0.4044.122","webStorageEnabled":true,"webdriver.remote.sessionid":"76336ae84fc897fb7abd5272b23fea14"}}
END     (3543)
SESSION: 76336ae84fc897fb7abd5272b23fea14
COMMAND (f5a3): POST /session/76336ae84fc897fb7abd5272b23fea14/timeouts REQ: {"implicit":5000}
DATA    (f5a3): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (f5a3)
COMMAND (f45f): POST /session/76336ae84fc897fb7abd5272b23fea14/url REQ: {"url":"https://exampletest.app/user"}
DATA    (f45f): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (f45f)
COMMAND (e05e): POST /session/76336ae84fc897fb7abd5272b23fea14/element REQ: {"using":"css selector","value":"#loginForm"}
DATA    (e05e): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":{"ELEMENT":"0.7279714935599724-1"}}
END     (e05e)
COMMAND (78c2): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-1/element REQ: {"using":"css selector","value":"#username"}
DATA    (78c2): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":{"ELEMENT":"0.7279714935599724-2"}}
END     (78c2)
COMMAND (eeaa): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-2/value REQ: {"text":"testUser","value":["t","e","s","t","U","s","e","r"]}
DATA    (eeaa): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (eeaa)
COMMAND (494c): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-1/element REQ: {"using":"css selector","value":"#password"}
DATA    (494c): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":{"ELEMENT":"0.7279714935599724-3"}}
END     (494c)
COMMAND (72f3): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-3/value REQ: {"text":"password","value":["p","a","s","s","w","o","r","d"]}
DATA    (72f3): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (72f3)
COMMAND (2e17): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-1/element REQ: {"using":"css selector","value":"#loginButton"}
DATA    (2e17): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":{"ELEMENT":"0.7279714935599724-4"}}
END     (2e17)
COMMAND (83a2): POST /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-4/click
DATA    (83a2): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (83a2)
COMMAND (0cc0): POST /session/76336ae84fc897fb7abd5272b23fea14/element REQ: {"using":"css selector","value":"h3"}
DATA    (0cc0): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":{"ELEMENT":"0.7279714935599724-5"}}
END     (0cc0)
COMMAND (26ce): GET /session/76336ae84fc897fb7abd5272b23fea14/element/0.7279714935599724-5/text
DATA    (26ce): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":"Timeline"}
END     (26ce)
COMMAND (62ef): DELETE /session/76336ae84fc897fb7abd5272b23fea14
DATA    (62ef): {"sessionId":"76336ae84fc897fb7abd5272b23fea14","status":0,"value":null}
END     (62ef)
SESSION END: 76336ae84fc897fb7abd5272b23fea14
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
