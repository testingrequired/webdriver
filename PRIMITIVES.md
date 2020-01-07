# Primitives

## WebDriver

The lowest level primitive communicating directly with the webdriver server. Element query methods return element ids.

## Browser

Higher level abstraction around `WebDriver`. Element query methods return `WebElement` and can accept extended `WebElement` classes instead.

## WebElement

Representing a web element in the page. Can be extended to provide page object like functionality.

```javascript
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

## By

A pair of values (`using` & `value`) representing how to query for element/s. `using` is the strategy (e.g. `"css selector"`, `"xpath"`) and `value` is input for that strategy.

```javascript
const by = new By("css selector", "#loginForm");
```

### Aliases

| Method               | Example                        |
| :------------------- | :----------------------------- |
| `By.css`             | `By.css("#loginForm")`         |
| `By.xpath`           | `By.xpath("//body")`           |
| `By.tagName`         | `By.tagName("body")`           |
| `By.linkText`        | `By.linkText("Logout")`        |
| `By.partialLinkText` | `By.partialLinkText("Logout")` |
