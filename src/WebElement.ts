import Browser from "./Browser";
import { By } from "./By";

export default class WebElement {
  constructor(
    public readonly browser: Browser,
    public readonly by: By,
    public elementId: string
  ) {}

  async findElement(by: By, WebElementClass = WebElement) {
    return this.browser.findElementFromElement(
      this.elementId,
      by,
      WebElementClass
    );
  }

  async $(selector: string, WebElementClass = WebElement) {
    return this.findElement(new By("css selector", selector), WebElementClass);
  }

  async findElements(by: By, WebElementClass = WebElement) {
    return this.browser.findElementsFromElement(
      this.elementId,
      by,
      WebElementClass
    );
  }

  async $$(selector: string, WebElementClass = WebElement) {
    return this.findElements(new By("css selector", selector), WebElementClass);
  }

  async text() {
    return await this.browser.elementText(this);
  }
}
