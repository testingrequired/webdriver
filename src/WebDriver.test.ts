import WebDriver from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";
import WebdriverOptions from "./WebdriverOptions";
import { Events } from "./events";

jest.mock("node-fetch");

describe("WebDriver 2", () => {
  const webdriverOptions: WebdriverOptions = {
    remoteUrl: "remoteUrl",
    desiredCapabilities: {},
  };

  it("should call register handlers callback on initialization", () => {
    const registerHandlersSpy = jest.fn();
    const driver = new WebDriver(webdriverOptions, {}, registerHandlersSpy);
    expect(registerHandlersSpy).toBeCalledWith(driver);
  });

  it("should not have a session id defined on initialization", () => {
    const driver = new WebDriver(webdriverOptions, {});
    expect(driver.sessionId).toBeUndefined();
  });

  it("should emit session event when session is initiated", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const spy = jest.fn();
    driver.on(Events.Session, spy);

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    expect(spy).toBeCalledWith(webdriverOptions.desiredCapabilities);
  });

  it("should send request to webdriver server when session is initiated", async () => {
    const driver = new WebDriver(webdriverOptions, {});

    await driver.newSession();

    expect(fetch).toBeCalledWith(`remoteUrl/session`, {
      method: "POST",
      body: '{"desiredCapabilities":{}}',
    });
  });

  it("should define session id when session is created", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    expect(driver.sessionId).toBe(sessionId);
  });

  it("should emit session success event when session is created", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const spy = jest.fn();
    driver.on(Events.SessionSuccess, spy);

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    try {
      await driver.newSession();
    } catch (e) {}

    expect(spy).toBeCalledWith(sessionId);

    expect(fetch).toBeCalledWith(`remoteUrl/session`, {
      method: "POST",
      body: '{"desiredCapabilities":{}}',
    });
  });

  it("should configure timeouts when session is created", async () => {
    const sessionId = "expectedSessionId";
    const expectedImplicitTimeout = 5000;
    const expectedScriptTimeout = 5001;
    const expectedPageLoadTimeout = 5002;

    const driver = new WebDriver(webdriverOptions, {
      implicit: expectedImplicitTimeout,
      script: expectedScriptTimeout,
      pageLoad: expectedPageLoadTimeout,
    });

    const spy = jest.fn();
    driver.on(Events.SessionSuccess, spy);

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    expect(driver.timeoutsConfig.implicit).toBe(expectedImplicitTimeout);
    expect(driver.timeoutsConfig.script).toBe(expectedScriptTimeout);
    expect(driver.timeoutsConfig.pageLoad).toBe(expectedPageLoadTimeout);
  });

  it("should emit session fail event when session fails", async () => {
    const driver = new WebDriver(webdriverOptions, {});
    const expectedBody = { message: "expectedErrorMessage" };

    const spy = jest.fn();
    driver.on(Events.SessionFail, spy);

    const response = mockResponse(true, { body: expectedBody });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    try {
      await driver.newSession();
    } catch (e) {}

    expect(spy).toBeCalledWith(
      new Error(`Error creating session: ${JSON.stringify(expectedBody)}`)
    );
  });

  it.skip("should rethrow error when session fails", async () => {
    const driver = new WebDriver(webdriverOptions, {});
    const expectedBody = { message: "expectedErrorMessage" };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
      mockResponse(true, { body: expectedBody })
    );

    expect(driver.newSession.bind(driver)).toThrowError(
      new Error(`Error creating session: ${JSON.stringify(expectedBody)}`)
    );
  });

  it("should send request to webdriver server when session is deleted", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.deleteSession();

    expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}`, {
      method: "DELETE",
    });
  });

  it("should clear session id when session is deleted", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.deleteSession();

    expect(driver.sessionId).toBeUndefined();
  });

  it("should emit session end event when session is deleted", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const spy = jest.fn();
    driver.on(Events.SessionEnd, spy);

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    await driver.deleteSession();

    expect(spy).toBeCalledWith(sessionId);
  });

  it("should make request to webdriver server when url is called", async () => {
    const sessionId = "expectedSessionId";
    const expectedUrl = "expectedUrl";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.url(expectedUrl);

    expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/url`, {
      method: "POST",
      body: JSON.stringify({ url: expectedUrl }),
    });
  });

  it("should make request to webdriver server when source is called", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.source();

    expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/source`, {
      method: "GET",
    });
  });

  it("should make request to webdriver server when closeWindow is called", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.closeWindow();

    expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/window`, {
      method: "DELETE",
    });
  });

  it("should make request to webdriver server when sendKeysElement is called", async () => {
    const sessionId = "expectedSessionId";
    const expectedElementId = "expectedElementId";
    const expectedText = "expectedText";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

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

  it("should make request to webdriver server when executeScript is called", async () => {
    const sessionId = "expectedSessionId";
    const expectedScript = "expectedScript";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

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

  it("should make request to webdriver server when executeFunction is called", async () => {
    const sessionId = "expectedSessionId";
    const expectedScript = function () {
      return true;
    };

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.executeFunction(expectedScript);

    expect(fetch).toBeCalledWith(
      `remoteUrl/session/${sessionId}/execute/sync`,
      {
        method: "POST",
        body: JSON.stringify({
          script:
            "return (function () {\n            return true;\n        }).apply(null, arguments)",
          args: [],
        }),
      }
    );
  });

  it("should make request to webdriver server when setTimeouts is called", async () => {
    const sessionId = "expectedSessionId";

    const driver = new WebDriver(webdriverOptions, {});

    const response = mockResponse(true, { body: { sessionId } });
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(response);

    await driver.newSession();

    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    await driver.setTimeouts({ implicit: 100 });

    expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}/timeouts`, {
      body: `{"implicit":100}`,
      method: "POST",
    });
  });
});

describe("WebDriver", () => {
  const webdriverOptions: WebdriverOptions = {
    remoteUrl: "remoteUrl",
    desiredCapabilities: {},
  };
  let driver: WebDriver;
  let response: Response;
  let registerHandlersSpy: jest.Mock;

  beforeEach(async () => {
    registerHandlersSpy = jest.fn();
    driver = new WebDriver(webdriverOptions, {}, registerHandlersSpy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("command", () => {
    const expectedUrl = "expectedUrl";
    const expectedMethod = "GET";

    let commandSpy: jest.Mock;
    let commandEndSpy: jest.Mock;
    let commandSuccessSpy: jest.Mock;
    let commandFailSpy: jest.Mock;

    beforeEach(() => {
      commandSpy = jest.fn();
      driver.on(Events.Command, commandSpy);

      commandEndSpy = jest.fn();
      driver.on(Events.CommandEnd, commandEndSpy);

      commandSuccessSpy = jest.fn();
      driver.on(Events.CommandSuccess, commandSuccessSpy);

      commandFailSpy = jest.fn();
      driver.on(Events.CommandFail, commandFailSpy);
    });

    describe("when called", () => {
      const body = { foo: "bar" };

      it("should emit command event", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, body);
        } catch (e) {}

        expect(commandSpy).toBeCalledWith(
          "remoteUrl" + expectedUrl,
          expectedMethod,
          body
        );
      });
    });

    describe("when succeeds", () => {
      const body = { foo: "bar" };

      beforeEach(() => {
        response = mockResponse(true, { body });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should emit command:success event", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, {});
        } catch (e) {}

        expect(commandSuccessSpy).toBeCalledWith(
          body,
          response,
          "remoteUrl" + expectedUrl,
          expectedMethod
        );
      });

      it("should emit command:end event", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, {});
        } catch (e) {}

        expect(commandEndSpy).toBeCalledWith(
          response,
          "remoteUrl" + expectedUrl,
          expectedMethod
        );
      });
    });

    describe("when fails", () => {
      const expectedResponseText = "Test";

      beforeEach(() => {
        response = mockResponse(false, { text: expectedResponseText });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should emit command:fail event", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, {});
        } catch (e) {}

        expect(commandFailSpy).toBeCalledWith(expect.any(Error), response);
      });

      it("should emit command:end event", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, {});
        } catch (e) {}

        expect(commandEndSpy).toBeCalledWith(
          response,
          "remoteUrl" + expectedUrl,
          expectedMethod
        );
      });

      it("should throw error with response text", async () => {
        try {
          await driver.command(expectedUrl, expectedMethod, {});
          fail("Did not throw error");
        } catch (e) {
          expect(e.message).toBe(expectedResponseText);
        }
      });
    });
  });

  describe("session", () => {
    describe("when created", () => {
      const sessionId = "expectedSessionId";
      let sessionStartEventSpy: jest.Mock;

      beforeEach(async () => {
        sessionStartEventSpy = jest.fn();
        driver.on(Events.Session, sessionStartEventSpy);

        response = mockResponse(true, { body: { sessionId } });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );

        await driver.newSession();
      });

      describe("elements", () => {
        const expectedElementId = "expectedElementId";

        describe("find element", () => {
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          let findElementEventSpy: jest.Mock;
          let findElementSuccessEventSpy: jest.Mock;
          let findElementFailEventSpy: jest.Mock;
          let elementId: string | undefined;

          beforeEach(() => {
            findElementEventSpy = jest.fn();
            driver.on(Events.FindElement, findElementEventSpy);
            findElementSuccessEventSpy = jest.fn();
            driver.on(Events.FindElementSuccess, findElementSuccessEventSpy);
            findElementFailEventSpy = jest.fn();
            driver.on(Events.FindElementFail, findElementFailEventSpy);
          });

          describe("when successful", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: { value: { ELEMENT: expectedElementId } },
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementId = await driver.findElement(by);
            });

            it("should make request to webdriver", async () => {
              expect(fetch).toBeCalledWith(
                "remoteUrl/session/expectedSessionId/element",
                {
                  body: `{"using":"${strategy}","value":"${selector}"}`,
                  method: "POST",
                }
              );
            });

            it("should return element id", async () => {
              expect(elementId).toBe(expectedElementId);
            });

            it("should emit findElement event", () => {
              expect(findElementEventSpy).toBeCalledWith(by);
            });

            it("should emit findElement:success event", () => {
              expect(findElementSuccessEventSpy).toBeCalledWith(
                by,
                expectedElementId
              );
            });
          });

          describe("when failed", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {},
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              await driver.findElement(by);
            });

            it("should emit findElement:fail event", () => {
              expect(findElementFailEventSpy).toBeCalledWith(by);
            });
          });
        });

        describe("find element from element", () => {
          const fromElementId = "fromElementId";
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          let findElementEventSpy: jest.Mock;
          let findElementSuccessEventSpy: jest.Mock;
          let findElementFailEventSpy: jest.Mock;
          let elementId: string | undefined;

          beforeEach(async () => {
            findElementEventSpy = jest.fn();
            driver.on(Events.FindElementFromElement, findElementEventSpy);
            findElementSuccessEventSpy = jest.fn();
            driver.on(
              Events.FindElementFromElementSuccess,
              findElementSuccessEventSpy
            );
            findElementFailEventSpy = jest.fn();
            driver.on(
              Events.FindElementFromElementFail,
              findElementFailEventSpy
            );
          });

          describe("when successful", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: { value: { ELEMENT: expectedElementId } },
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementId = await driver.findElementFromElement(
                fromElementId,
                by
              );
            });

            it("should make request to webdriver", async () => {
              expect(fetch).toBeCalledWith(
                `remoteUrl/session/expectedSessionId/element/${fromElementId}/element`,
                {
                  body: `{"using":"${strategy}","value":"${selector}"}`,
                  method: "POST",
                }
              );
            });

            it("should return element ids", async () => {
              expect(elementId).toBe(expectedElementId);
            });

            it("should emit findElement event", () => {
              expect(findElementEventSpy).toBeCalledWith(fromElementId, by);
            });

            it("should emit findElement:successEvent", () => {
              expect(findElementSuccessEventSpy).toBeCalledWith(
                fromElementId,
                by,
                expectedElementId
              );
            });
          });

          describe("when failed", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {},
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              await driver.findElementFromElement(fromElementId, by);
            });

            it("should emit findElementFromElement:fail event", () => {
              expect(findElementFailEventSpy).toBeCalledWith(fromElementId, by);
            });
          });
        });

        describe("find elements", () => {
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          const expectedElementIds = [
            "expectedElementId",
            "expectedElementId2",
          ];
          let findElementsEventSpy: jest.Mock;
          let findElementsSuccessEventSpy: jest.Mock;
          let findElementsFailEventSpy: jest.Mock;
          let elementIds: Array<string>;

          beforeEach(() => {
            findElementsEventSpy = jest.fn();
            driver.on(Events.FindElements, findElementsEventSpy);
            findElementsSuccessEventSpy = jest.fn();
            driver.on(Events.FindElementsSuccess, findElementsSuccessEventSpy);
            findElementsFailEventSpy = jest.fn();
            driver.on(Events.FindElementsFail, findElementsFailEventSpy);
          });

          describe("when successful", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {
                  value: expectedElementIds.map((ELEMENT) => ({ ELEMENT })),
                },
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementIds = await driver.findElements(by);
            });

            it("should make request to webdriver", async () => {
              expect(fetch).toBeCalledWith(
                "remoteUrl/session/expectedSessionId/elements",
                {
                  body: `{"using":"${strategy}","value":"${selector}"}`,
                  method: "POST",
                }
              );
            });

            it("should return element ids", async () => {
              expect(elementIds).toStrictEqual(expectedElementIds);
            });

            it("should emit findElements:success event", () => {
              expect(findElementsSuccessEventSpy).toBeCalledWith(
                by,
                expectedElementIds
              );
            });
          });

          describe("when fail", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {},
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementIds = await driver.findElements(by);
            });

            it("should return an empty list", () => {
              expect(elementIds).toHaveLength(0);
            });

            it("should emit findElements:fail event", () => {
              expect(findElementsFailEventSpy).toBeCalledWith(by);
            });
          });
        });

        describe("find elements from element", () => {
          const fromElementId = "fromElementId";
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          const expectedElementIds = [
            "expectedElementId",
            "expectedElementId2",
          ];
          let findElementsFromElementEventSpy: jest.Mock;
          let findElementsFromElementSuccessEventSpy: jest.Mock;
          let findElementsFailEventSpy: jest.Mock;
          let elementIds: Array<string>;

          beforeEach(() => {
            findElementsFromElementEventSpy = jest.fn();
            driver.on(
              Events.FindElementsFromElement,
              findElementsFromElementEventSpy
            );
            findElementsFromElementSuccessEventSpy = jest.fn();
            driver.on(
              Events.FindElementsFromElementSuccess,
              findElementsFromElementSuccessEventSpy
            );
            findElementsFailEventSpy = jest.fn();
            driver.on(
              Events.FindElementsFromElementFail,
              findElementsFailEventSpy
            );
          });

          describe("when successful", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {
                  value: expectedElementIds.map((ELEMENT) => ({ ELEMENT })),
                },
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementIds = await driver.findElementsFromElement(
                by,
                fromElementId
              );
            });

            it("should make request to webdriver", async () => {
              expect(fetch).toBeCalledWith(
                `remoteUrl/session/expectedSessionId/element/${fromElementId}/elements`,
                {
                  body: `{"using":"${strategy}","value":"${selector}"}`,
                  method: "POST",
                }
              );
            });

            it("should return element ids", async () => {
              expect(elementIds).toStrictEqual(expectedElementIds);
            });

            it("should emit findElementsFromElement event", () => {
              expect(findElementsFromElementEventSpy).toBeCalledWith(
                by,
                fromElementId
              );
            });

            it("should emit findElementsFromElement:success event", () => {
              expect(findElementsFromElementSuccessEventSpy).toBeCalledWith(
                fromElementId,
                by,
                expectedElementIds
              );
            });
          });

          describe("when fail", () => {
            beforeEach(async () => {
              response = mockResponse(true, {
                body: {},
              });

              (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
                response
              );

              elementIds = await driver.findElementsFromElement(
                by,
                fromElementId
              );
            });

            it("should return an empty list", () => {
              expect(elementIds).toHaveLength(0);
            });

            it("should emit findElements:fail event", () => {
              expect(findElementsFailEventSpy).toBeCalledWith(by);
            });
          });
        });

        describe("element text", () => {
          const expectedText = "expectedText";

          beforeEach(async () => {
            response = mockResponse(true, {
              body: {
                value: { ELEMENT: expectedElementId },
              },
            });

            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
              response
            );

            const response2 = mockResponse(true, {
              body: { value: expectedText },
            });

            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
              response2
            );
          });

          it("should make request to webdriver", async () => {
            await driver.elementText(expectedElementId);

            expect(fetch).toBeCalledWith(
              "remoteUrl/session/expectedSessionId/element/expectedElementId/text",
              {
                method: "GET",
              }
            );
          });
        });

        describe("click element", () => {
          it("should make request to webdriver", async () => {
            await driver.clickElement(expectedElementId);

            expect(fetch).toBeCalledWith(
              "remoteUrl/session/expectedSessionId/element/expectedElementId/click",
              {
                method: "POST",
              }
            );
          });
        });
      });
    });
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
