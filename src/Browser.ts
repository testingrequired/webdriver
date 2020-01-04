import WebDriver from "./WebDriver";
import { By } from "./By";
import WebElement from "./WebElement";

export default class Browser {
  constructor(public readonly driver: WebDriver) {}

  async findElement(by: By, WebElementClass = WebElement) {
    const elementId = await this.driver.findElement(by);

    return new WebElementClass(this, by, elementId);
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

  async go(url: string) {
    await this.driver.url(url);
  }

  async close() {
    await this.driver.closeWindow();
  }
}
