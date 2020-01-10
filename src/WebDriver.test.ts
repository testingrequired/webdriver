import WebDriver from "./WebDriver";
import { By } from "./By";
import fetch, { Response } from "node-fetch";
import WebdriverOptions from "./WebdriverOptions";

jest.mock("node-fetch");

describe("WebDriver", () => {
  const webdriverOptions: WebdriverOptions = {
    remoteUrl: "remoteUrl",
    desiredCapabilities: {}
  };
  let driver: WebDriver;
  let response: Response;

  beforeEach(async () => {
    driver = new WebDriver(webdriverOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("session", () => {
    describe("when created", () => {
      const sessionId = "expectedSessionId";
      let sessionStartEventSpy: jest.Mock;

      beforeEach(async () => {
        sessionStartEventSpy = jest.fn();
        driver.on("sessionStart", sessionStartEventSpy);

        response = mockJsonResponse({ sessionId });

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
          body: '{"desiredCapabilities":{}}'
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
          driver.on("sessionEnd", sessionEndEventSpy);
          await driver.deleteSession();
        });

        it("should not have a session id defined", () => {
          expect(driver.sessionId).not.toBeDefined();
        });

        it("should make request to webdriver", () => {
          expect(fetch).toBeCalledWith(`remoteUrl/session/${sessionId}`, {
            method: "DELETE"
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
            driver.on("findElement", findElementEventSpy);
            findElementSuccessEventSpy = jest.fn();
            driver.on("findElement:success", findElementSuccessEventSpy);
            findElementFailEventSpy = jest.fn();
            driver.on("findElement:fail", findElementFailEventSpy);
          });

          describe("when successful", () => {
            beforeEach(async () => {
              response = mockJsonResponse({
                value: { ELEMENT: expectedElementId }
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
                  method: "POST"
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
              response = mockJsonResponse({});

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
          let elementId: string | undefined;

          beforeEach(async () => {
            findElementEventSpy = jest.fn();
            driver.on("findElementFromElement", findElementEventSpy);
            findElementSuccessEventSpy = jest.fn();
            driver.on(
              "findElementFromElement:success",
              findElementSuccessEventSpy
            );

            response = mockJsonResponse({
              value: { ELEMENT: expectedElementId }
            });

            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
              response
            );

            elementId = await driver.findElementFromElement(fromElementId, by);
          });

          it("should make request to webdriver", async () => {
            expect(fetch).toBeCalledWith(
              `remoteUrl/session/expectedSessionId/element/${fromElementId}/element`,
              {
                body: `{"using":"${strategy}","value":"${selector}"}`,
                method: "POST"
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

        describe("find elements", () => {
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          const expectedElementIds = [
            "expectedElementId",
            "expectedElementId2"
          ];
          let findElementsEventSpy: jest.Mock;
          let findElementsSuccessEventSpy: jest.Mock;
          let elementIds: Array<string>;

          beforeEach(async () => {
            findElementsEventSpy = jest.fn();
            driver.on("findElements", findElementsEventSpy);
            findElementsSuccessEventSpy = jest.fn();
            driver.on("findElements:success", findElementsSuccessEventSpy);

            response = mockJsonResponse({
              value: expectedElementIds.map(ELEMENT => ({ ELEMENT }))
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
                method: "POST"
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

        describe("find elements from element", () => {
          const fromElementId = "fromElementId";
          const selector = "body";
          const strategy = "css selector";
          const by = new By(strategy, selector);
          const expectedElementIds = [
            "expectedElementId",
            "expectedElementId2"
          ];
          let findElementsFromElementEventSpy: jest.Mock;
          let findElementsFromElementSuccessEventSpy: jest.Mock;
          let elementIds: Array<string>;

          beforeEach(async () => {
            findElementsFromElementEventSpy = jest.fn();
            driver.on(
              "findElementsFromElement",
              findElementsFromElementEventSpy
            );
            findElementsFromElementSuccessEventSpy = jest.fn();
            driver.on(
              "findElementsFromElement:success",
              findElementsFromElementSuccessEventSpy
            );

            response = mockJsonResponse({
              value: expectedElementIds.map(ELEMENT => ({ ELEMENT }))
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
                method: "POST"
              }
            );
          });

          it("should return element ids", async () => {
            expect(elementIds).toStrictEqual(expectedElementIds);
          });

          it("should emit findElementsFromElement:success event", () => {
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

        describe("element text", () => {
          const expectedText = "expectedText";

          beforeEach(async () => {
            response = mockJsonResponse({
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
            await driver.elementText(expectedElementId);

            expect(fetch).toBeCalledWith(
              "remoteUrl/session/expectedSessionId/element/expectedElementId/text",
              {
                method: "GET"
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
                method: "POST"
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
              method: "POST"
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
              method: "DELETE"
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
              body: JSON.stringify({ text, value: text.split("") })
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
                  "return (function () {\n                    return true;\n                }).apply(null, arguments)",
                args: []
              })
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
              method: "POST"
            }
          );
        });
      });
    });

    describe("when fails to create", () => {
      beforeEach(async () => {
        response = mockJsonResponse({});

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

function mockJsonResponse(body: any) {
  const response = new Response();

  response.json = jest.fn(async () => {
    return body;
  });

  response.text = jest.fn();

  response.ok = true;

  return response;
}
