import WebDriver, { TimeoutsConfig } from "./WebDriver";
import WebdriverOptions from "./WebdriverOptions";
import { By } from "./By";
import WebElement from "./WebElement";
import { ElementNotFoundError } from "./errors";
import Constructor from "./Constructor";

export default class Browser {
  constructor(public readonly driver: WebDriver) {}

  async session(fn: (browser: Browser) => void) {
    try {
      await this.driver.newSession();
      await fn.call(null, this);
    } finally {
      await this.driver.deleteSession();
    }
  }

  static build(options: WebdriverOptions, timeoutsConfig?: TimeoutsConfig) {
    const driver = new WebDriver(options, timeoutsConfig);
    return new Browser(driver);
  }

  static chrome(
    webdriverOptions: WebdriverOptions,
    timeoutsConfig?: TimeoutsConfig
  ) {
    return Browser.build(
      {
        ...webdriverOptions,
        desiredCapabilities: {
          ...webdriverOptions.desiredCapabilities,
          browserName: "chrome"
        }
      },
      timeoutsConfig
    );
  }

  async findElement(
    by: By,
    WebElementClass: Constructor<WebElement> = WebElement
  ) {
    const elementId = await this.driver.findElement(by);

    if (typeof elementId === "undefined") {
      throw new ElementNotFoundError(
        `Unable to find element using ${by.using}: ${by.value}`
      );
    }

    return new WebElementClass(this, by, elementId);
  }

  async $(
    selector: string,
    WebElementClass: Constructor<WebElement> = WebElement
  ) {
    return this.findElement(By.css(selector), WebElementClass);
  }

  async findElementFromElement(
    fromElementId: string,
    by: By,
    WebElementClass: Constructor<WebElement> = WebElement
  ) {
    const elementId = await this.driver.findElementFromElement(
      fromElementId,
      by
    );

    if (typeof elementId === "undefined") {
      throw new ElementNotFoundError(
        `Unable to find element using ${by.using}: ${by.value}`
      );
    }

    return new WebElementClass(this, by, elementId);
  }

  async findElements(
    by: By,
    WebElementClass: Constructor<WebElement> = WebElement
  ) {
    const elementIds = await this.driver.findElements(by);

    return elementIds.map(
      elementId => new WebElementClass(this, by, elementId)
    );
  }

  async $$(
    selector: string,
    WebElementClass: Constructor<WebElement> = WebElement
  ) {
    return this.findElements(By.css(selector), WebElementClass);
  }

  async findElementsFromElement(
    fromElementId: string,
    by: By,
    WebElementClass: Constructor<WebElement> = WebElement
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
    return this.findElement(By.xpath(selector), WebElementClass);
  }

  async elementText(element: WebElement) {
    return await this.driver.elementText(element.elementId);
  }

  async clickElement(element: WebElement) {
    await this.driver.clickElement(element.elementId);
  }

  async go(url: string) {
    await this.driver.url(url);
  }

  async close() {
    await this.driver.closeWindow();
  }
}
