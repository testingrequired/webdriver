import WebDriver from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";
import WebdriverOptions from "./WebdriverOptions";
import { Events } from "./events";

jest.mock("node-fetch");

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

  describe("registerHandlers", () => {
    it("should be called", () => {
      expect(registerHandlersSpy).toBeCalledWith(driver);
    });
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

      it("should define a session id", () => {
        expect(driver.sessionId).toBeDefined();
      });

      it("should make request to webdriver", () => {
        expect(fetch).toBeCalledWith(`remoteUrl/session`, {
          method: "POST",
          body: '{"desiredCapabilities":{}}',
        });
      });

      it("should emit newSession event", () => {
        expect(sessionStartEventSpy).toBeCalledWith(
          webdriverOptions.desiredCapabilities
        );
      });

      describe("then session is deleted", () => {
        let sessionEndEventSpy: jest.Mock;

        beforeEach(async () => {
          sessionEndEventSpy = jest.fn();
          driver.on(Events.SessionEnd, sessionEndEventSpy);
          await driver.deleteSession();
        });

        it("should not have a session id defined", () => {
          expect(driver.sessionId).not.toBeDefined();
        });

        it("should make request to webdriver", () => {
          expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}`, {
            method: "DELETE",
          });
        });

        it("should emit sessionEnd event", () => {
          expect(sessionEndEventSpy).toBeCalledWith(sessionId);
        });
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

      describe("url", () => {
        const expectedUrl = "expectedUrl";
        it("should make request to webdriver", async () => {
          await driver.url(expectedUrl);

          expect(fetch).toBeCalledWith(
            "remoteUrl/session/expectedSessionId/url",
            {
              body: `{"url":"${expectedUrl}"}`,
              method: "POST",
            }
          );
        });
      });

      describe("source", () => {
        it("should make request to webdriver", async () => {
          await driver.source();

          expect(fetch).toBeCalledWith(
            "remoteUrl/session/expectedSessionId/source",
            {
              method: "GET",
            }
          );
        });
      });

      describe("closeWindow", () => {
        it("should make request to webdriver", async () => {
          await driver.closeWindow();

          expect(fetch).toBeCalledWith(
            "remoteUrl/session/expectedSessionId/window",
            {
              method: "DELETE",
            }
          );
        });
      });

      describe("sendKeysElement", () => {
        const expectedElementId = "expectedElementId";
        const text = "expectedText";

        it("should make request to webdriver", async () => {
          await driver.sendKeysElement(expectedElementId, text);

          expect(fetch).toBeCalledWith(
            `remoteUrl/session/expectedSessionId/element/${expectedElementId}/value`,
            {
              method: "POST",
              body: JSON.stringify({ text, value: text.split("") }),
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
                args: [],
              }),
            }
          );
        });
      });

      describe("executeFunction", () => {
        const expectedScript = function () {
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
                  "return (function () {\n                    return true;\n                }).apply(null, arguments)",
                args: [],
              }),
            }
          );
        });
      });

      describe("setTimeouts", () => {
        it("should make request to webdriver", async () => {
          await driver.setTimeouts({});

          expect(fetch).toBeCalledWith(
            "remoteUrl/session/expectedSessionId/timeouts",
            {
              body: `{}`,
              method: "POST",
            }
          );
        });
      });
    });

    describe("when fails to create", () => {
      beforeEach(async () => {
        response = mockResponse(true, { body: {} });

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          response
        );
      });

      it("should throw error", async () => {
        try {
          await driver.newSession();
          fail("Did not throw error");
        } catch (e) {
          expect(e.message).toBe(`Error creating session: {}`);
        }
      });
    });

    describe("when not active", () => {
      it("should not have a session id defined", () => {
        expect(driver.sessionId).not.toBeDefined();
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
