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

  async findElement<T extends WebElement>(
    by: By,
    WebElementClass?: Constructor<T>
  ): Promise<T> {
    const elementId = await this.driver.findElement(by);

    if (typeof elementId === "undefined") {
      throw new ElementNotFoundError(
        `Unable to find element using ${by.using}: ${by.value}`
      );
    }

    const WebElementImplementation: Constructor<T> = (WebElementClass ||
      WebElement) as any; // TODO: This is, admittedly, a hack

    const element: T = new WebElementImplementation(this, by, elementId);

    return element;
  }

  async $<T extends WebElement>(
    selector: string,
    WebElementClass?: Constructor<T>
  ) {
    return this.findElement<T>(By.css(selector), WebElementClass);
  }

  async findElementFromElement<T extends WebElement>(
    fromElementId: string,
    by: By,
    WebElementClass?: Constructor<T>
  ): Promise<T> {
    const elementId = await this.driver.findElementFromElement(
      fromElementId,
      by
    );

    if (typeof elementId === "undefined") {
      throw new ElementNotFoundError(
        `Unable to find element using ${by.using}: ${by.value}`
      );
    }

    const WebElementImplementation: Constructor<T> = (WebElementClass ||
      WebElement) as any; // TODO: This is, admittedly, a hack

    const element: T = new WebElementImplementation(this, by, elementId);

    return element;
  }

  async findElements<T extends WebElement>(
    by: By,
    WebElementClass?: Constructor<T>
  ): Promise<Array<T>> {
    const elementIds = await this.driver.findElements(by);

    const WebElementImplementation: Constructor<T> = (WebElementClass ||
      WebElement) as any; // TODO: This is, admittedly, a hack

    return elementIds.map(
      elementId => new WebElementImplementation(this, by, elementId)
    );
  }

  async $$<T extends WebElement>(
    selector: string,
    WebElementClass?: Constructor<T>
  ) {
    return this.findElements<T>(By.css(selector), WebElementClass);
  }

  async findElementsFromElement<T extends WebElement>(
    fromElementId: string,
    by: By,
    WebElementClass?: Constructor<T>
  ): Promise<Array<T>> {
    const elementIds = await this.driver.findElementsFromElement(
      by,
      fromElementId
    );

    const WebElementImplementation: Constructor<T> = (WebElementClass ||
      WebElement) as any; // TODO: This is, admittedly, a hack

    return elementIds.map(
      elementId => new WebElementImplementation(this, by, elementId)
    );
  }

  async $x<T extends WebElement>(
    selector: string,
    WebElementClass?: Constructor<T>
  ) {
    return this.findElement<T>(By.xpath(selector), WebElementClass);
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

  async sendKeysElement(element: WebElement, text: string) {
    await this.driver.sendKeysElement(element.elementId, text);
  }
}
