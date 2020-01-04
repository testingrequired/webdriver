# webdriver

A webdriver library

## Note

This is not a production ready project yet. Breaking changes should be expected.

## Usage

```javascript
import assert from "assert";
import { Browser } from "@testingrequired/webdriver";

(async () => {
  const remoteUrl = "http://localhost:4444/wd/hub";

  await Browser.chrome({ remoteUrl }).session(async browser => {
    await browser.go("https://www.exampletest.app/");

    const header = await browser.$("html");

    const header2 = await browser.$x("//html");

    assert.strictEqual(header.elementId, header2.elementId);
  });
})();
```

## Goals

- Use real promises
- First class page objects
