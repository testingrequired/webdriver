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
      beforeEach(async () => {
        element = await browser.findElement(
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
      beforeEach(() => {
        callback.mockImplementation(() => {
          throw new Error();
        });

        browser.session(callback);
      });

      it("should delete session", () => {
        expect(driver.deleteSession).toBeCalled();
      });

      it("should close window", () => {
        callback.mockImplementation(() => {
          throw new Error();
        });
      });
    });
  });
});

class CustomWebElement extends WebElement {}
