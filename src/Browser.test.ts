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
        value: {}
      };
    });

    browser = new Browser(driver);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    describe("when passing an extended web element class", () => {
      it("should return a WebElement", async () => {
        const element = await browser.findElement(
          new By("css selector", ""),
          CustomWebElement
        );

        expect(element).toBeInstanceOf(CustomWebElement);
      });
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

  describe("$", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(async () => {
      driver.findElement = jest.fn(async () => expectedElementId);
    });

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        element = await browser.$("", CustomWebElement);
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
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
        driver.findElementFromElement = jest.fn(async () => {
          return undefined;
        });
      });

      it("should throw element not found error", async () => {
        try {
          await browser.findElementFromElement(
            "fromElementId",
            new By("css selector", expectedSelector)
          );
          fail("Did not throw error");
        } catch (e) {
          expect(e).toBeInstanceOf(ElementNotFoundError);
          expect(e.message).toBe(
            `Unable to find element using css selector: ${expectedSelector}`
          );
        }
      });
    });

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        element = await browser.findElementFromElement(
          "fromElementId",
          new By("css selector", ""),
          CustomWebElement
        );
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
      });
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

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        elements = await browser.findElements(
          new By("css selector", ""),
          CustomWebElement
        );

        element = elements[0];
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
      });
    });
  });

  describe("$$", () => {
    const expectedElementId = "expectedElementId";
    let elements: Array<CustomWebElement>;
    let element: WebElement;

    beforeEach(async () => {
      driver.findElements = jest.fn(async () => [expectedElementId]);
    });

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        elements = await browser.$$("", CustomWebElement);
        element = elements[0];
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
      });
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

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        elements = await browser.findElementsFromElement(
          "fromElementId",
          new By("css selector", ""),
          CustomWebElement
        );

        element = elements[0];
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
      });
    });
  });

  describe("$x", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(async () => {
      driver.findElement = jest.fn(async () => expectedElementId);
    });

    describe("when passing an extended web element class", () => {
      beforeEach(async () => {
        element = await browser.$x("", CustomWebElement);
      });

      it("should return a WebElement", async () => {
        expect(element).toBeInstanceOf(CustomWebElement);
      });
    });
  });

  describe("go", () => {
    const expectedUrl = "expectedUrl";

    beforeEach(() => {
      driver.url = jest.fn();
    });

    it("should call driver method", () => {
      browser.go(expectedUrl);

      expect(driver.url).toBeCalledWith(expectedUrl);
    });
  });

  describe("close", () => {
    beforeEach(() => {
      driver.closeWindow = jest.fn();
    });

    it("should call driver method", () => {
      browser.close();

      expect(driver.closeWindow).toBeCalled();
    });
  });

  describe("session", () => {
    const callback = jest.fn();

    beforeEach(() => {
      driver.newSession = jest.fn();
      driver.deleteSession = jest.fn();
      driver.closeWindow = jest.fn();

      browser.session(callback);
    });

    afterEach(() => {
      callback.mockClear();
    });

    it("should call the callback with browser instance", () => {
      expect(callback).toBeCalledWith(browser);
    });

    it("should create a new session", () => {
      expect(driver.newSession).toBeCalled();
    });

    describe("when error is thrown", () => {
      beforeEach(async () => {
        callback.mockImplementation(() => {
          throw new Error();
        });

        try {
          await browser.session(callback);
          fail("Error was not thrown");
        } catch (e) {}
      });

      it("should delete session", () => {
        expect(driver.deleteSession).toBeCalled();
      });
    });
  });

  describe("elementText", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(() => {
      element = new WebElement(browser, By.css(""), expectedElementId);

      driver.elementText = jest.fn();
    });

    it("should call driver method", async () => {
      await browser.elementText(element);

      expect(driver.elementText).toBeCalledWith(expectedElementId);
    });
  });

  describe("clickElement", () => {
    const expectedElementId = "expectedElementId";
    let element: WebElement;

    beforeEach(() => {
      element = new WebElement(browser, By.css(""), expectedElementId);

      driver.clickElement = jest.fn();
    });

    it("should call driver method", async () => {
      await browser.clickElement(element);

      expect(driver.clickElement).toBeCalledWith(expectedElementId);
    });
  });

  describe("sendKeysElement", () => {
    const expectedElementId = "expectedElementId";
    const expectedText = "expectedText";
    let element: WebElement;

    beforeEach(() => {
      element = new WebElement(browser, By.css(""), expectedElementId);

      driver.sendKeysElement = jest.fn();
    });

    it("should call driver method", async () => {
      await browser.sendKeysElement(element, expectedText);

      expect(driver.sendKeysElement).toBeCalledWith(
        expectedElementId,
        expectedText
      );
    });
  });
});

class CustomWebElement extends WebElement {
  customMethod() {}
}
