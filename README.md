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
SESSION: {"browserName":"chrome"}
COMMAND (a915): POST /session REQ: {"desiredCapabilities":{"browserName":"chrome"}}
DATA    (a915): {"status":0,"sessionId":"9c217f86dff4cb0c293de5f71083345c","value":{"acceptInsecureCerts":false,"acceptSslCerts":false,"applicationCacheEnabled":false,"browserConnectionEnabled":false,"browserName":"chrome","chrome":{"chromedriverVersion":"2.43.600210 (68dcf5eebde37173d4027fa8635e332711d2874a)","userDataDir":"..."},"cssSelectorsEnabled":true,"databaseEnabled":false,"goog:chromeOptions":{"debuggerAddress":"localhost:61977"},"handlesAlerts":true,"hasTouchScreen":false,"javascriptEnabled":true,"locationContextEnabled":true,"mobileEmulationEnabled":false,"nativeEvents":true,"networkConnectionEnabled":false,"pageLoadStrategy":"normal","platform":"Windows NT","rotatable":false,"setWindowRect":true,"takesHeapSnapshot":true,"takesScreenshot":true,"unexpectedAlertBehaviour":"","version":"81.0.4044.122","webStorageEnabled":true,"webdriver.remote.sessionid":"9c217f86dff4cb0c293de5f71083345c"}}
END     (a915)
SESSION START: 9c217f86dff4cb0c293de5f71083345c
COMMAND (ed49): POST /session/9c217f86dff4cb0c293de5f71083345c/timeouts REQ: {"implicit":5000}
DATA    (ed49): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (ed49)
COMMAND (4f2e): POST /session/9c217f86dff4cb0c293de5f71083345c/url REQ: {"url":"https://exampletest.app/user"}
DATA    (4f2e): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (4f2e)
COMMAND (dc58): POST /session/9c217f86dff4cb0c293de5f71083345c/element REQ: {"using":"css selector","value":"#loginForm"}
DATA    (dc58): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":{"ELEMENT":"0.16882579187628277-1"}}
END     (dc58)
COMMAND (7b16): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-1/element REQ: {"using":"css selector","value":"#username"}
DATA    (7b16): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":{"ELEMENT":"0.16882579187628277-2"}}
END     (7b16)
COMMAND (4636): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-2/value REQ: {"text":"testUser","value":["t","e","s","t","U","s","e","r"]}
DATA    (4636): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (4636)
COMMAND (1ebb): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-1/element REQ: {"using":"css selector","value":"#password"}
DATA    (1ebb): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":{"ELEMENT":"0.16882579187628277-3"}}
END     (1ebb)
COMMAND (dd68): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-3/value REQ: {"text":"password","value":["p","a","s","s","w","o","r","d"]}
DATA    (dd68): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (dd68)
COMMAND (40f4): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-1/element REQ: {"using":"css selector","value":"#loginButton"}
DATA    (40f4): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":{"ELEMENT":"0.16882579187628277-4"}}
END     (40f4)
COMMAND (59c9): POST /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-4/click
DATA    (59c9): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (59c9)
COMMAND (e73f): POST /session/9c217f86dff4cb0c293de5f71083345c/element REQ: {"using":"css selector","value":"h3"}
DATA    (e73f): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":{"ELEMENT":"0.16882579187628277-5"}}
END     (e73f)
COMMAND (5f46): GET /session/9c217f86dff4cb0c293de5f71083345c/element/0.16882579187628277-5/text
DATA    (5f46): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":"Timeline"}
END     (5f46)
COMMAND (2a72): DELETE /session/9c217f86dff4cb0c293de5f71083345c
DATA    (2a72): {"sessionId":"9c217f86dff4cb0c293de5f71083345c","status":0,"value":null}
END     (2a72)
SESSION END: 9c217f86dff4cb0c293de5f71083345c
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
