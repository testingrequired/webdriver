import WebDriver from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";

jest.mock("node-fetch");

describe("WebDriver", () => {
  let driver: WebDriver;

  beforeEach(async () => {
    driver = new WebDriver({
      remoteUrl: "remoteUrl"
    });

    await driver.newSession();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("session", () => {
    beforeEach(() => {
      driver.deleteSession();
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
        beforeEach(() => {
          driver.deleteSession();
        });

        it("should not have a session id defined", () => {
          expect(driver.sessionId).not.toBeDefined();
        });
      });
    });
  });

  describe("find element", () => {
    const selector = "body";
    const strategy = "css selector";
    const by = new By(strategy, selector);
    const expectedElementId = "expectedElementId";

    beforeEach(async () => {
      const response = mockJsonResponse({
        value: { ELEMENT: expectedElementId }
      });

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);
    });

    it("should make request to webdriver", async () => {
      await driver.findElement(by);

      expect(fetch).toBeCalledWith("remoteUrl/session//element", {
        body: `{"using":"${strategy}","value":"${selector}"}`,
        method: "POST"
      });
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

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);
    });

    it("should make request to webdriver", async () => {
      await driver.findElementFromElement(fromElementId, by);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session//element/${fromElementId}/element`,
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

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);
    });

    it("should make request to webdriver", async () => {
      await driver.findElements(by);

      expect(fetch).toBeCalledWith("remoteUrl/session//elements", {
        body: `{"using":"${strategy}","value":"${selector}"}`,
        method: "POST"
      });
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

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);
    });

    it("should make request to webdriver", async () => {
      await driver.findElementsFromElement(by, fromElementId);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session//element/${fromElementId}/elements`,
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
});

function mockJsonResponse(body: any) {
  const response = new Response();

  response.json = jest.fn(async () => {
    return body;
  });

  return response;
}
