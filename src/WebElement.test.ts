import Browser from "./Browser";
import WebDriver from "./WebDriver";
import WebElement from "./WebElement";
import { By } from "./By";

describe("WebElement", () => {
  const expectedElementId = "expectedElementId";
  let driver;
  let browser: Browser;
  let element: WebElement;
  let by: By;

  beforeEach(() => {
    driver = new WebDriver({ remoteUrl: "", desiredCapabilities: {} });
    browser = new Browser(driver);
    by = By.xpath("");
    element = new WebElement(browser, by, expectedElementId);
  });

  describe("findElement", () => {
    beforeEach(() => {
      browser.findElementFromElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.findElement(by);

      expect(browser.findElementFromElement).toBeCalledWith(
        expectedElementId,
        by,
        WebElement
      );
    });
  });

  describe("$", () => {
    beforeEach(() => {
      browser.findElementFromElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.$(by.value);

      expect(browser.findElementFromElement).toBeCalledWith(
        expectedElementId,
        By.css(by.value),
        WebElement
      );
    });
  });
});
