import WebDriver, { WebdriverOptions } from "./WebDriver";
import { By } from "./By";
import WebElement from "./WebElement";

export default class Browser {
  constructor(public readonly driver: WebDriver) {}

  async session(fn: Function) {
    try {
      await this.driver.newSession();
      await fn.call(null, this);
    } finally {
      await this.close();
      await this.driver.deleteSession();
    }
  }

  static build(options: WebdriverOptions) {
    const driver = new WebDriver(options);
    return new Browser(driver);
  }

  static chrome(webdriverOptions: WebdriverOptions) {
    return Browser.build({
      ...webdriverOptions,
      desiredCapabilities: {
        ...webdriverOptions.desiredCapabilities,
        browserName: "chrome"
      }
    });
  }

  async findElement(by: By, WebElementClass = WebElement) {
    const elementId = await this.driver.findElement(by);

    return new WebElementClass(this, by, elementId);
  }

  async $(selector: string, WebElementClass = WebElement) {
    return this.findElement(new By("css selector", selector), WebElementClass);
  }

  async findElementFromElement(
    fromElementId: string,
    by: By,
    WebElementClass = WebElement
  ) {
    const elementId = await this.driver.findElementFromElement(
      fromElementId,
      by
    );

    return new WebElementClass(this, by, elementId);
  }

  async findElements(by: By, WebElementClass = WebElement) {
    const elementIds = await this.driver.findElements(by);

    return elementIds.map(
      elementId => new WebElementClass(this, by, elementId)
    );
  }

  async $$(selector: string, WebElementClass = WebElement) {
    return this.findElements(new By("css selector", selector), WebElementClass);
  }

  async findElementsFromElement(
    fromElementId: string,
    by: By,
    WebElementClass = WebElement
  ) {
    const elementIds = await this.driver.findElementsFromElement(
      by,
      fromElementId
    );

    return elementIds.map(
      elementId => new WebElementClass(this, by, elementId)
    );
  }

  async $x(selector: string, WebElementClass = WebElement) {
    return this.findElement(new By("xpath", selector), WebElementClass);
  }

  async elementText(element: WebElement) {
    return await this.driver.elementText(element.elementId);
  }

  async go(url: string) {
    await this.driver.url(url);
  }

  async close() {
    await this.driver.closeWindow();
  }
}
