import WebDriver from "./WebDriver";
import Browser from "./Browser";
import { By } from "./By";
import WebElement from "./WebElement";
import { ElementNotFoundError } from "./errors";

describe("Browser", () => {
  const expectedSessionId = "expectedSessionId";

  let driver: WebDriver;
  let browser: Browser;

  beforeEach(() => {
    driver = new WebDriver({ remoteUrl: "", desiredCapabilities: {} });
    driver.newSession = jest.fn(async function() {
      return {
        sessionId: expectedSessionId,
        capabilities: {}
      };
    });

    browser = new Browser(driver);
  });

  describe("findElement", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(async () => {
      driver.findElement = jest.fn(async () => expectedElementId);
      element = await browser.findElement(new By("css selector", ""));
    });

    it("should return a WebElement", async () => {
      expect(element).toBeInstanceOf(WebElement);
    });

    it("should have element id set", () => {
      expect(element.elementId).toBe(expectedElementId);
    });

    describe("when element not found", () => {
      const expectedSelector = "expectedSelector";

      beforeEach(() => {
        driver.findElement = jest.fn(async () => {
          return undefined;
        });
      });

      it("should throw element not found error", () => {
        expect(
          browser.findElement(new By("css selector", expectedSelector))
        ).rejects.toEqual(
          new ElementNotFoundError(
            `Unable to find element using css selector: ${expectedSelector}`
          )
        );
      });
    });
  });

  describe("findElementFromElement", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(async () => {
      driver.findElementFromElement = jest.fn(async () => expectedElementId);
      element = await browser.findElementFromElement(
        "fromElementId",
        new By("css selector", "")
      );
    });

    it("should return a WebElement", async () => {
      expect(element).toBeInstanceOf(WebElement);
    });

    it("should have element id set", () => {
      expect(element.elementId).toBe(expectedElementId);
    });

    describe("when element not found", () => {
      const expectedSelector = "expectedSelector";

      beforeEach(() => {
        driver.findElement = jest.fn(async () => {
          return undefined;
        });
      });

      it("should throw element not found error", () => {
        expect(
          browser.findElement(new By("css selector", expectedSelector))
        ).rejects.toEqual(
          new ElementNotFoundError(
            `Unable to find element using css selector: ${expectedSelector}`
          )
        );
      });
    });
  });

  describe("findElements", () => {
    const expectedElementId = "expectedElementId";
    let elements: Array<WebElement>;
    let element: WebElement;

    beforeEach(async () => {
      driver.findElements = jest.fn(async () => [expectedElementId]);
      elements = await browser.findElements(new By("css selector", ""));
      element = elements[0];
    });

    it("should return a WebElement", async () => {
      expect(element).toBeInstanceOf(WebElement);
    });

    it("should have element id set", () => {
      expect(element.elementId).toBe(expectedElementId);
    });
  });

  describe("findElementsFromElement", () => {
    const expectedElementId = "expectedElementId";
    let elements: Array<WebElement>;
    let element: WebElement;

    beforeEach(async () => {
      driver.findElementsFromElement = jest.fn(async () => [expectedElementId]);
      elements = await browser.findElementsFromElement(
        "fromElementId",
        new By("css selector", "")
      );
      element = elements[0];
    });

    it("should return a WebElement", async () => {
      expect(element).toBeInstanceOf(WebElement);
    });

    it("should have element id set", () => {
      expect(element.elementId).toBe(expectedElementId);
    });
  });
});
