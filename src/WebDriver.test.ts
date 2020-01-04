import WebDriver from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";

jest.mock("node-fetch");

describe("WebDriver", () => {
  let driver: WebDriver;

  beforeEach(async () => {
    driver = new WebDriver({
      remoteUrl: "remoteUrl",
      desiredCapabilities: {}
    });

    const response = mockJsonResponse({
      sessionId: "expectedSessionId"
    });

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("session", () => {
    beforeEach(async () => {
      await driver.deleteSession();
    });

    it("should not have a session id defined", () => {
      expect(driver.sessionId).not.toBeDefined();
    });

    describe("when new session", () => {
      beforeEach(async () => {
        await driver.newSession();
      });

      it("should define a session id", () => {
        expect(driver.sessionId).toBeDefined();
      });

      describe("with deleted session", () => {
        beforeEach(async () => {
          await driver.deleteSession();
        });

        it("should not have a session id defined", () => {
          expect(driver.sessionId).not.toBeDefined();
        });

        it("should make request to webdriver", () => {
          expect(fetch).toBeCalledWith("remoteUrl/session/expectedSessionId", {
            method: "DELETE"
          });
        });
      });
    });
  });

  describe("elements", () => {
    describe("find element", () => {
      const selector = "body";
      const strategy = "css selector";
      const by = new By(strategy, selector);
      const expectedElementId = "expectedElementId";

      beforeEach(async () => {
        const response = mockJsonResponse({
          value: { ELEMENT: expectedElementId }
        });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should make request to webdriver", async () => {
        await driver.findElement(by);

        expect(fetch).toBeCalledWith(
          "remoteUrl/session/expectedSessionId/element",
          {
            body: `{"using":"${strategy}","value":"${selector}"}`,
            method: "POST"
          }
        );
      });

      it("should return element id", async () => {
        expect(await driver.findElement(by)).toBe(expectedElementId);
      });
    });

    describe("find element from element", () => {
      const fromElementId = "fromElementId";
      const selector = "body";
      const strategy = "css selector";
      const by = new By(strategy, selector);
      const expectedElementId = "expectedElementId";

      beforeEach(async () => {
        const response = mockJsonResponse({
          value: { ELEMENT: expectedElementId }
        });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should make request to webdriver", async () => {
        await driver.findElementFromElement(fromElementId, by);

        expect(fetch).toBeCalledWith(
          `remoteUrl/session/expectedSessionId/element/${fromElementId}/element`,
          {
            body: `{"using":"${strategy}","value":"${selector}"}`,
            method: "POST"
          }
        );
      });

      it("should return element ids", async () => {
        expect(await driver.findElementFromElement(fromElementId, by)).toBe(
          expectedElementId
        );
      });
    });

    describe("find elements", () => {
      const selector = "body";
      const strategy = "css selector";
      const by = new By(strategy, selector);
      const expectedElementIds = ["expectedElementId", "expectedElementId2"];

      beforeEach(async () => {
        const response = mockJsonResponse({
          value: expectedElementIds.map(ELEMENT => ({ ELEMENT }))
        });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should make request to webdriver", async () => {
        await driver.findElements(by);

        expect(fetch).toBeCalledWith(
          "remoteUrl/session/expectedSessionId/elements",
          {
            body: `{"using":"${strategy}","value":"${selector}"}`,
            method: "POST"
          }
        );
      });

      it("should return element ids", async () => {
        expect(await driver.findElements(by)).toStrictEqual(expectedElementIds);
      });
    });

    describe("find elements from element", () => {
      const fromElementId = "fromElementId";
      const selector = "body";
      const strategy = "css selector";
      const by = new By(strategy, selector);
      const expectedElementIds = ["expectedElementId", "expectedElementId2"];

      beforeEach(async () => {
        const response = mockJsonResponse({
          value: expectedElementIds.map(ELEMENT => ({ ELEMENT }))
        });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should make request to webdriver", async () => {
        await driver.findElementsFromElement(by, fromElementId);

        expect(fetch).toBeCalledWith(
          `remoteUrl/session/expectedSessionId/element/${fromElementId}/elements`,
          {
            body: `{"using":"${strategy}","value":"${selector}"}`,
            method: "POST"
          }
        );
      });

      it("should return element ids", async () => {
        expect(
          await driver.findElementsFromElement(by, fromElementId)
        ).toStrictEqual(expectedElementIds);
      });
    });

    describe("element text", () => {
      const expectedElementId = "expectedElementId";
      const expectedText = "expectedText";

      beforeEach(async () => {
        const response = mockJsonResponse({
          value: { ELEMENT: expectedElementId }
        });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );

        const response2 = mockJsonResponse({ value: expectedText });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response2
        );
      });

      it("should make request to webdriver", async () => {
        const element = await driver.elementText(expectedElementId);

        element && driver.elementText(element);

        expect(fetch).toBeCalledWith(
          "remoteUrl/session/expectedSessionId/element/expectedElementId/text",
          {
            method: "GET"
          }
        );
      });
    });
  });

  describe("url", () => {
    const expectedUrl = "expectedUrl";
    it("should make request to webdriver", async () => {
      await driver.url(expectedUrl);

      expect(fetch).toBeCalledWith("remoteUrl/session/expectedSessionId/url", {
        body: `{"url":"${expectedUrl}"}`,
        method: "POST"
      });
    });
  });

  describe("closeWindow", () => {
    it("should make request to webdriver", async () => {
      await driver.closeWindow();

      expect(fetch).toBeCalledWith(
        "remoteUrl/session/expectedSessionId/window",
        {
          method: "DELETE"
        }
      );
    });
  });

  describe("executeScript", () => {
    const expectedScript = "expectedScript";
    it("should make request to webdriver", async () => {
      await driver.executeScript(expectedScript);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/expectedSessionId/execute/sync`,
        {
          method: "POST",
          body: JSON.stringify({
            script: expectedScript,
            args: []
          })
        }
      );
    });
  });

  describe("executeFunction", () => {
    const expectedScript = function() {
      return true;
    };

    it("should make request to webdriver", async () => {
      await driver.executeFunction(expectedScript);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/expectedSessionId/execute/sync`,
        {
          method: "POST",
          body: JSON.stringify({
            script:
              "return (function () {\n            return true;\n        }).apply(null, arguments)",
            args: []
          })
        }
      );
    });
  });
});

function mockJsonResponse(body: any) {
  const response = new Response();

  response.json = jest.fn(async () => {
    return body;
  });

  response.text = jest.fn();

  response.ok = true;

  return response;
}
