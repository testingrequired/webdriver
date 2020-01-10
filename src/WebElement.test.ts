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

  describe("text", () => {
    beforeEach(() => {
      browser.elementText = jest.fn();
    });

    it("should call browser", async () => {
      await element.text();

      expect(browser.elementText).toBeCalledWith(element);
    });
  });

  describe("sendKeys", () => {
    const expectedText = "expectedText";

    beforeEach(() => {
      browser.sendKeysElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.sendKeys(expectedText);

      expect(browser.sendKeysElement).toBeCalledWith(element, expectedText);
    });
  });

  describe("click", () => {
    beforeEach(() => {
      browser.clickElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.click();

      expect(browser.clickElement).toBeCalledWith(element);
    });
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

  describe("findElements", () => {
    beforeEach(() => {
      browser.findElementsFromElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.findElements(by);

      expect(browser.findElementsFromElement).toBeCalledWith(
        expectedElementId,
        by,
        WebElement
      );
    });
  });

  describe("$$", () => {
    beforeEach(() => {
      browser.findElementsFromElement = jest.fn();
    });

    it("should call browser", async () => {
      await element.$$(by.value);

      expect(browser.findElementsFromElement).toBeCalledWith(
        expectedElementId,
        By.css(by.value),
        WebElement
      );
    });
  });

  describe("executeFunction", () => {
    let spy: jest.Mock;

    beforeEach(async () => {
      browser.driver.executeFunction = jest.fn();
      spy = jest.fn();
      await element.executeFunction(spy, "foo", "bar");
    });

    it("should call driver", async () => {
      expect(browser.driver.executeFunction).toBeCalledWith(
        spy,
        by.value,
        "foo",
        "bar"
      );
    });
  });
});
