import WebDriver, { WebdriverOptions } from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";
import { Events } from "./events";
import { Command } from "./Command";

jest.mock("node-fetch");
const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

jest.mock("uuid");

describe("WebDriver", () => {
  const sessionId = "expectedSessionId";

  const webdriverOptions: WebdriverOptions = {
    remoteUrl: "remoteUrl",
    desiredCapabilities: {},
  };

  let driver: WebDriver;

  beforeEach(() => {
    driver = new WebDriver(webdriverOptions, {});
  });

  describe("when initializing", () => {
    it("should not have a session id defined on initialization", () => {
      expect(driver.sessionId).toBeUndefined();
    });

    it("should call register handlers callback on initialization", () => {
      const registerHandlersSpy = jest.fn();

      driver = new WebDriver(webdriverOptions, {}, registerHandlersSpy);

      expect(registerHandlersSpy).toBeCalledWith(driver);
    });
  });

  describe("when creating session", () => {
    it("should emit session event when session is initiated", async () => {
      const spy = jest.fn();
      driver.on(Events.Session, spy);

      await setupSession(driver);

      expect(spy).toBeCalledWith(webdriverOptions.desiredCapabilities);
    });

    it("should send request to webdriver server when session is initiated", async () => {
      await setupSession(driver);

      expect(fetch).toBeCalledWith(`remoteUrl/session`, {
        method: "POST",
        body: '{"desiredCapabilities":{}}',
      });
    });

    it("should define session id when session is created", async () => {
      await setupSession(driver, sessionId);

      expect(driver.sessionId).toBe(sessionId);
    });

    it("should emit session success event when session is created", async () => {
      const spy = jest.fn();
      driver.on(Events.SessionSuccess, spy);

      await setupSession(driver, sessionId);

      expect(spy).toBeCalledWith(sessionId);
    });

    it("should make request to webdriver server when session is created", async () => {
      await setupSession(driver);

      expect(fetch).toBeCalledWith(`remoteUrl/session`, {
        method: "POST",
        body: '{"desiredCapabilities":{}}',
      });
    });

    it("should configure timeouts when session is created", async () => {
      const expectedImplicitTimeout = 5000;
      const expectedScriptTimeout = 5001;
      const expectedPageLoadTimeout = 5002;

      driver = new WebDriver(webdriverOptions, {
        implicit: expectedImplicitTimeout,
        script: expectedScriptTimeout,
        pageLoad: expectedPageLoadTimeout,
      });

      const spy = jest.fn();
      driver.on(Events.SessionSuccess, spy);

      await setupSession(driver);

      expect(driver.timeoutsConfig.implicit).toBe(expectedImplicitTimeout);
      expect(driver.timeoutsConfig.script).toBe(expectedScriptTimeout);
      expect(driver.timeoutsConfig.pageLoad).toBe(expectedPageLoadTimeout);
    });

    it("should emit session fail event when session creation fails", async () => {
      const expectedBody = { message: "expectedErrorMessage" };

      const spy = jest.fn();
      driver.on(Events.SessionFail, spy);

      try {
        await setupFailedSession(driver, expectedBody);
      } catch (e) {}

      expect(spy).toBeCalledWith(
        new Error(`Error creating session: ${JSON.stringify(expectedBody)}`)
      );
    });

    it.skip("should rethrow error when session creation fails", async () => {
      const expectedBody = { message: "expectedErrorMessage" };

      expect(driver.newSession.bind(driver)).toThrowError(
        new Error(`Error creating session: ${JSON.stringify(expectedBody)}`)
      );
    });
  });

  describe("when deleting session", () => {
    it("should send request to webdriver server", async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.deleteSession();

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}`, {
        method: "DELETE",
      });
    });

    it("should clear session id", async () => {
      await setupSession(driver);
      fetchMock.mockClear();

      await driver.deleteSession();

      expect(driver.sessionId).toBeUndefined();
    });

    it("should emit session end event", async () => {
      const spy = jest.fn();
      driver.on(Events.SessionEnd, spy);

      await setupSession(driver, sessionId);

      await driver.deleteSession();

      expect(spy).toBeCalledWith(sessionId);
    });
  });

  describe("when changing urls", () => {
    it("should make request to webdriver server", async () => {
      const expectedUrl = "expectedUrl";

      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.url(expectedUrl);

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/url`, {
        method: "POST",
        body: JSON.stringify({ url: expectedUrl }),
      });
    });
  });

  describe("when getting page source", () => {
    it("should make request to webdriver server", async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.source();

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/source`, {
        method: "GET",
      });
    });
  });

  describe("when closing a window", () => {
    it("should make request to webdriver server", async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.closeWindow();

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/window`, {
        method: "DELETE",
      });
    });
  });

  describe("when sending keys to an element", () => {
    it("should make request to webdriver server", async () => {
      const expectedElementId = "expectedElementId";
      const expectedText = "expectedText";

      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.sendKeysElement(expectedElementId, expectedText);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/element/${expectedElementId}/value`,
        {
          method: "POST",
          body: JSON.stringify({
            text: expectedText,
            value: expectedText.split(""),
          }),
        }
      );
    });
  });

  describe("when executing script", () => {
    it("should make request to webdriver server", async () => {
      const expectedScript = "expectedScript";

      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.executeScript(expectedScript);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/execute/sync`,
        {
          method: "POST",
          body: JSON.stringify({
            script: expectedScript,
            args: [],
          }),
        }
      );
    });

    describe("when script is a function", () => {
      it("should make request to webdriver server", async () => {
        const expectedScript = function () {
          return true;
        };

        await setupSession(driver, sessionId);
        fetchMock.mockClear();

        await driver.executeFunction(expectedScript);

        expect(fetch).toBeCalledWith(
          `remoteUrl/session/${sessionId}/execute/sync`,
          {
            method: "POST",
            body: JSON.stringify({
              script: `return (${expectedScript.toString()}).apply(null, arguments)`,
              args: [],
            }),
          }
        );
      });
    });
  });

  describe("when setting timeouts", () => {
    it("should make request to webdriver server", async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();

      await driver.setTimeouts({ implicit: 100 });

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/timeouts`, {
        body: `{"implicit":100}`,
        method: "POST",
      });
    });
  });

  describe("when finding an element", () => {
    const by = By.css(".testClass");

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.findElement(by);

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/element`, {
        body: JSON.stringify(by),
        method: "POST",
      });
    });

    it("should emit find element event", async () => {
      const spy = jest.fn();
      driver.on(Events.FindElement, spy);

      await driver.findElement(by);

      expect(spy).toBeCalledWith(by);
    });

    it("should return element id when element is found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: { ELEMENT: expectedElementId } },
        })
      );

      const elementId = await driver.findElement(by);

      expect(elementId).toBe(expectedElementId);
    });

    it("should emit find element success event when element is found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: { ELEMENT: expectedElementId } },
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementSuccess, spy);

      await driver.findElement(by);

      expect(spy).toBeCalledWith(by, expectedElementId);
    });

    it("should emit find element fail event when element is not found", async () => {
      fetchMock.mockResolvedValue(mockResponse(true, { body: {} }));

      const spy = jest.fn();
      driver.on(Events.FindElementFail, spy);

      await driver.findElement(by);

      expect(spy).toBeCalledWith(by);
    });

    it("should return undefined when element is not found", async () => {
      fetchMock.mockResolvedValue(mockResponse(true, { body: {} }));

      expect(await driver.findElement(by)).toBeUndefined();
    });
  });

  describe("when finding an element within another element", () => {
    const expectedFromElementId = "expectedFromElementId";
    const by = By.css(".testClass");

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.findElementFromElement(expectedFromElementId, by);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/element/${expectedFromElementId}/element`,
        {
          body: JSON.stringify(by),
          method: "POST",
        }
      );
    });

    it("should emit find element from element event", async () => {
      const spy = jest.fn();
      driver.on(Events.FindElementFromElement, spy);

      await driver.findElementFromElement(expectedFromElementId, by);

      expect(spy).toBeCalledWith(expectedFromElementId, by);
    });

    it("should return element id when element is found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: { ELEMENT: expectedElementId } },
        })
      );

      const elementId = await driver.findElementFromElement(
        expectedFromElementId,
        by
      );

      expect(elementId).toBe(expectedElementId);
    });

    it("should emit find element from element success event when element is found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: { ELEMENT: expectedElementId } },
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementFromElementSuccess, spy);

      await driver.findElementFromElement(expectedFromElementId, by);

      expect(spy).toBeCalledWith(expectedFromElementId, by, expectedElementId);
    });

    it("should emit find element from element fail event when element is not found", async () => {
      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: {},
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementFromElementFail, spy);

      await driver.findElementFromElement(expectedFromElementId, by);

      expect(spy).toBeCalledWith(expectedFromElementId, by);
    });

    it("should return undefined when element is not found", async () => {
      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: {},
        })
      );

      const elementId = await driver.findElementFromElement(
        expectedFromElementId,
        by
      );

      expect(elementId).toBeUndefined();
    });
  });

  describe("when finding elements", () => {
    const by = By.css(".testClass");

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.findElements(by);

      expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/elements`, {
        body: JSON.stringify(by),
        method: "POST",
      });
    });

    it("should emit find elements event", async () => {
      const spy = jest.fn();
      driver.on(Events.FindElements, spy);

      await driver.findElements(by);

      expect(spy).toBeCalledWith(by);
    });

    it("should return element ids when elements are found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: [{ ELEMENT: expectedElementId }] },
        })
      );

      const elementIds = await driver.findElements(by);

      expect(Array.isArray(elementIds)).toBeTruthy();
      expect(elementIds).toHaveLength(1);
      expect(elementIds[0]).toBe(expectedElementId);
    });

    it("should emit find elements success event when elements are found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: [{ ELEMENT: expectedElementId }] },
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementsSuccess, spy);

      await driver.findElements(by);

      expect(spy).toBeCalledWith(by, [expectedElementId]);
    });

    it("should emit find element fail event when elements are not found", async () => {
      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: {},
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementsFail, spy);

      await driver.findElements(by);

      expect(spy).toBeCalledWith(by);
    });
  });

  describe("when finding an elements within another element", () => {
    const expectedFromElementId = "expectedFromElementId";
    const by = By.css(".testClass");

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.findElementsFromElement(by, expectedFromElementId);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/element/${expectedFromElementId}/elements`,
        {
          body: JSON.stringify(by),
          method: "POST",
        }
      );
    });

    it("should emit find elements event", async () => {
      const spy = jest.fn();
      driver.on(Events.FindElementsFromElement, spy);

      await driver.findElementsFromElement(by, expectedFromElementId);

      expect(spy).toBeCalledWith(by, expectedFromElementId);
    });

    it("should return element ids when elements are found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: [{ ELEMENT: expectedElementId }] },
        })
      );

      const elementIds = await driver.findElementsFromElement(
        by,
        expectedFromElementId
      );

      expect(Array.isArray(elementIds)).toBeTruthy();
      expect(elementIds).toHaveLength(1);
      expect(elementIds[0]).toBe(expectedElementId);
    });

    it("should emit find elements success event when elements are found", async () => {
      const expectedElementId = "expectedElementId";

      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: { value: [{ ELEMENT: expectedElementId }] },
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementsFromElementSuccess, spy);

      await driver.findElementsFromElement(by, expectedFromElementId);

      expect(spy).toBeCalledWith(expectedFromElementId, by, [
        expectedElementId,
      ]);
    });

    it("should emit find element fail event when elements are not found", async () => {
      fetchMock.mockResolvedValue(
        mockResponse(true, {
          body: {},
        })
      );

      const spy = jest.fn();
      driver.on(Events.FindElementsFromElementFail, spy);

      await driver.findElementsFromElement(by, expectedFromElementId);

      expect(spy).toBeCalledWith(expectedFromElementId, by);
    });
  });

  describe("when getting the text of an element", () => {
    const expectedElementId = "expectedElementId";

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.elementText(expectedElementId);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/element/${expectedElementId}/text`,
        {
          method: "GET",
        }
      );
    });

    it("should return element text", async () => {
      const expectedElementText = "expectedElementText";

      fetchMock.mockResolvedValue(
        mockResponse(true, { body: { value: expectedElementText } })
      );

      const elementText = await driver.elementText(expectedElementId);

      expect(elementText).toBe(expectedElementText);
    });
  });

  describe("when clicking an element", () => {
    const expectedElementId = "expectedElementId";

    beforeEach(async () => {
      await setupSession(driver, sessionId);
      fetchMock.mockClear();
    });

    it("should make request to webdriver server", async () => {
      await driver.clickElement(expectedElementId);

      expect(fetch).toBeCalledWith(
        `remoteUrl/session/${sessionId}/element/${expectedElementId}/click`,
        {
          method: "POST",
        }
      );
    });
  });

  describe("when running a command", () => {
    const expectedRequestId = "expectedRequestId";
    const expectedUrl = "expectedUrl";
    const expectedMethod = "GET";
    const expectedBody = Symbol("expectedBody");
    const command = new Command(expectedUrl, expectedMethod, expectedBody);

    it.skip("should make request to webdriver server", () => {});

    it("should emit command event when command initiated", async () => {
      const spy = jest.fn();
      driver.on(Events.Command, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(expectedRequestId, command);
    });

    it("should emit dom snapshot event if command is set to snapshot", async () => {
      const expectedSnapshot = "expectedSnapshot";

      const command = new Command(
        expectedUrl,
        expectedMethod,
        expectedBody,
        true
      );

      fetchMock.mockResolvedValueOnce(
        mockResponse(true, { body: { value: expectedSnapshot } })
      );

      const spy = jest.fn();
      driver.on(Events.DOMSnapshot, spy);

      webdriverOptions.snapshotDOM = true;

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(expectedRequestId, command, expectedSnapshot);
    });

    it("should record dom snapshot if command is set to snapshot", async () => {
      const expectedSnapshot = "expectedSnapshot";

      const command = new Command(
        expectedUrl,
        expectedMethod,
        expectedBody,
        true
      );

      fetchMock.mockResolvedValueOnce(
        mockResponse(true, { body: { value: expectedSnapshot } })
      );

      webdriverOptions.snapshotDOM = true;

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(driver.getSnapshotFromCommand(command)).toBe(expectedSnapshot);
    });

    it("should not record dom snapshot if command is not set to snapshot", async () => {
      const expectedSnapshot = "expectedSnapshot";

      const command = new Command(expectedUrl, expectedMethod, expectedBody);

      fetchMock.mockResolvedValueOnce(
        mockResponse(true, { body: { value: expectedSnapshot } })
      );

      webdriverOptions.snapshotDOM = true;

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(driver.getSnapshotFromCommand(command)).toBeUndefined();
    });

    it("should emit command success event when command succeeds", async () => {
      const expectedResponseData = Symbol("expectedResponseData");
      const expectedResponse = mockResponse(true, {
        body: expectedResponseData,
      });

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandSuccess, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(
        expectedRequestId,
        command,
        expectedResponseData
      );
    });

    it("should emit command end event when command succeeds", async () => {
      const expectedResponseData = Symbol("expectedResponseData");
      const expectedResponse = mockResponse(true, {
        body: expectedResponseData,
      });

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandEnd, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(expectedRequestId, command);
    });

    it("should emit command fail event when command fails", async () => {
      const expectedErrorText = "expectedErrorText";
      const expectedResponse = mockResponse(false, { text: expectedErrorText });

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandFail, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(
        expectedRequestId,
        command,
        new Error(expectedErrorText),
        expectedResponse
      );
    });

    it("should emit command end event when command fails", async () => {
      const expectedErrorText = "expectedErrorText";
      const expectedResponse = mockResponse(false, { text: expectedErrorText });

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandEnd, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(expectedRequestId, command);
    });

    it("should throw error when command fails", async () => {
      const expectedErrorText = "expectedErrorText";
      const expectedResponse = mockResponse(false, { text: expectedErrorText });

      fetchMock.mockResolvedValue(expectedResponse);

      try {
        await driver.command(command);
        fail("Did not throw error");
      } catch (e) {
        expect(e.message).toBe(expectedErrorText);
      }
    });

    it("should emit command fail event when failing to parse response json", async () => {
      const expectedError = new Error();
      const expectedResponse = mockResponse(true, {});

      expectedResponse.json = async () => {
        throw expectedError;
      };

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandFail, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(
        expectedRequestId,
        command,
        expectedError,
        expectedResponse
      );
    });

    it("should emit command end event when failing to parse response json", async () => {
      const expectedError = new Error();
      const expectedResponse = mockResponse(true, {});

      expectedResponse.json = async () => {
        throw expectedError;
      };

      fetchMock.mockResolvedValue(expectedResponse);

      const spy = jest.fn();
      driver.on(Events.CommandEnd, spy);

      try {
        await driver.command(command, expectedRequestId);
      } catch (e) {}

      expect(spy).toBeCalledWith(expectedRequestId, command);
    });

    it("should throw error when failing to parse response json", async () => {
      const expectedError = new Error();
      const expectedResponse = mockResponse(true, {});

      expectedResponse.json = async () => {
        throw expectedError;
      };

      fetchMock.mockResolvedValue(expectedResponse);

      try {
        await driver.command(command, expectedRequestId);
        fail("Did not throw error");
      } catch (e) {
        expect(e).toBe(expectedError);
      }
    });

    describe("when session is active", () => {});
  });
});

function mockResponse(
  ok: boolean,
  { text, body }: { text?: string; body?: any }
): Response {
  const response = new Response();

  if (text) {
    response.text = jest.fn(async () => text);
  }

  if (body) {
    response.json = jest.fn(async () => {
      return body;
    });
  }

  response.ok = ok;

  return response;
}

function setupSession(
  driver: WebDriver,
  sessionId: string = "expectedSessionId"
) {
  const response = mockResponse(true, { body: { sessionId } });
  fetchMock.mockResolvedValue(response);

  return driver.newSession();
}

function setupFailedSession(driver: WebDriver, body: any) {
  const response = mockResponse(true, { body });
  fetchMock.mockResolvedValue(response);

  return driver.newSession();
}
