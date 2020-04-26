import fetch from "node-fetch";
import { By } from "./By";
import WebdriverOptions from "./WebdriverOptions";
import { EventEmitter } from "events";
import { Events } from "./events";
import { Command } from "./Command";

export interface TimeoutsConfig {
  script?: number;
  pageLoad?: number;
  implicit?: number;
}

export default class WebDriver extends EventEmitter {
  private _sessionId?: string;

  constructor(
    private options: WebdriverOptions,
    public timeoutsConfig: TimeoutsConfig = {},
    registerHandlers?: (driver: WebDriver) => void
  ) {
    super();

    if (registerHandlers) {
      registerHandlers(this);
    }
  }

  get sessionId() {
    return this._sessionId;
  }

  get capabilities() {
    return this.options.desiredCapabilities;
  }

  async command<T extends CommandResponse>(command: Command): Promise<T> {
    const { endpoint, method, body } = command;
    const url = `${this.options.remoteUrl}${endpoint}`;

    this.emit(Events.Command, url, method, body);

    const res = await fetch(url, { method, body: JSON.stringify(body) });

    if (!res.ok) {
      const error = new Error(await res.text());

      this.emit(Events.CommandFail, error, res);
      this.emit(Events.CommandEnd, res, url, method);

      throw error;
    }

    const data: T = await res.json();

    this.emit(Events.CommandSuccess, data, res, url, method);
    this.emit(Events.CommandEnd, res, url, method);

    return data;
  }

  sessionCommand<T extends CommandResponse>(command: Command) {
    return this.command<T>(
      new Command(
        `/session/${this.sessionId}${command.endpoint}`,
        command.method,
        command.body
      )
    );
  }

  async newSession() {
    const { desiredCapabilities } = this.options;

    this.emit(Events.Session, desiredCapabilities);

    const result = await this.command<NewSessionResponse>(
      new Command("/session", "POST", { desiredCapabilities })
    );

    if (!result.sessionId) {
      const error = new Error(
        `Error creating session: ${JSON.stringify(result)}`
      );

      this.emit(Events.SessionFail, error);

      throw error;
    }

    this._sessionId = result.sessionId;

    this.emit(Events.SessionSuccess, this.sessionId);

    await this.setTimeouts(this.timeoutsConfig);

    return result;
  }

  async deleteSession() {
    await this.command(new Command(`/session/${this.sessionId}`, "DELETE"));

    this.emit(Events.SessionEnd, this.sessionId);

    delete this._sessionId;
  }

  url(url: string) {
    return this.sessionCommand(new Command(`/url`, "POST", { url }));
  }

  async source() {
    const response = await this.sessionCommand<{ value: string }>(
      new Command(`/source`, "GET")
    );

    return response.value;
  }

  closeWindow() {
    return this.sessionCommand(new Command(`/window`, "DELETE"));
  }

  executeScript(script: string, ...args: Array<string>) {
    return this.sessionCommand(
      new Command(`/execute/sync`, "POST", { script, args })
    );
  }

  executeFunction(fn: Function, ...args: Array<string>) {
    return this.executeScript(
      `return (${fn.toString()}).apply(null, arguments)`,
      ...args
    );
  }

  setTimeouts(config: TimeoutsConfig) {
    return this.sessionCommand(new Command(`/timeouts`, "POST", config));
  }

  async findElement(by: By): Promise<string | undefined> {
    this.emit(Events.FindElement, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      new Command(`/element`, "POST", by)
    );

    if (!result.value) {
      this.emit(Events.FindElementFail, by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit(Events.FindElementSuccess, by, elementId);

    return elementId;
  }

  async findElementFromElement(
    fromElementId: string,
    by: By
  ): Promise<string | undefined> {
    this.emit(Events.FindElementFromElement, fromElementId, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      new Command(`/element/${fromElementId}/element`, "POST", by)
    );

    if (!result.value) {
      this.emit(Events.FindElementFromElementFail, fromElementId, by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit(
      Events.FindElementFromElementSuccess,
      fromElementId,
      by,
      elementId
    );

    return elementId;
  }

  async findElements(by: By): Promise<Array<string>> {
    this.emit(Events.FindElements, by);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(new Command(`/elements`, "POST", by));

    if (!result.value) {
      this.emit(Events.FindElementsFail, by);
      return [];
    }

    const elementIds = result.value.map((v) => v.ELEMENT);

    this.emit(Events.FindElementsSuccess, by, elementIds);

    return elementIds;
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    this.emit(Events.FindElementsFromElement, by, fromElementId);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(new Command(`/element/${fromElementId}/elements`, "POST", by));

    if (!result.value) {
      this.emit(Events.FindElementsFromElementFail, fromElementId, by);
      return [];
    }

    const elementIds = result.value.map((v) => v.ELEMENT);

    this.emit(
      Events.FindElementsFromElementSuccess,
      fromElementId,
      by,
      elementIds
    );

    return elementIds;
  }

  async elementText(elementId: string) {
    const result = await this.sessionCommand<CommandResponse<string>>(
      new Command(`/element/${elementId}/text`, "GET")
    );

    return result.value;
  }

  clickElement(elementId: string) {
    return this.sessionCommand(
      new Command(`/element/${elementId}/click`, "POST")
    );
  }

  sendKeysElement(elementId: string, text: string) {
    return this.sessionCommand(
      new Command(`/element/${elementId}/value`, "POST", {
        text,
        value: text.split(""),
      })
    );
  }
}

interface ElementIdValue {
  ELEMENT: string;
}

interface NewSessionResponse extends CommandResponse {
  sessionId: string;
}

interface CommandResponse<T = any> {
  value: T | null;
}
