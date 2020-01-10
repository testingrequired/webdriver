import fetch from "node-fetch";
import { By } from "./By";
import WebdriverOptions from "./WebdriverOptions";
import { EventEmitter } from "events";

export interface TimeoutsConfig {
  script?: number;
  pageLoad?: number;
  implicit?: number;
}

export default class WebDriver extends EventEmitter {
  private _sessionId?: string;

  constructor(
    private options: WebdriverOptions,
    private timeoutsConfig: TimeoutsConfig = {},
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

  async executeScript(script: string, ...args: Array<string>) {
    await this.sessionCommand(`/execute/sync`, "POST", { script, args });
  }

  executeFunction(fn: Function, ...args: Array<string>) {
    return this.executeScript(
      `return (${fn.toString()}).apply(null, arguments)`,
      ...args
    );
  }

  setTimeouts(config: TimeoutsConfig) {
    return this.sessionCommand("/timeouts", "POST", config);
  }

  async newSession() {
    const { desiredCapabilities } = this.options;

    this.emit("sessionStart", desiredCapabilities);

    const result = await this.command<NewSessionResponse>("/session", "POST", {
      desiredCapabilities
    });

    if (!result.sessionId) {
      const error = new Error(
        `Error creating session: ${JSON.stringify(result)}`
      );

      this.emit("sessionStart:fail", error);

      throw error;
    }

    this._sessionId = result.sessionId;

    this.emit("sessionStart:success", this.sessionId);

    await this.setTimeouts(this.timeoutsConfig);

    return result;
  }

  async deleteSession() {
    await this.command(`/session/${this.sessionId}`, "DELETE");

    this.emit("sessionEnd", this.sessionId);

    delete this._sessionId;
  }

  async command<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${this.options.remoteUrl}${command}`;

    this.emit("command", url, method, body);

    const res = await fetch(url, { method, body: JSON.stringify(body) });

    if (!res.ok) {
      const error = new Error(await res.text());

      this.emit("command:fail", error, res);
      this.emit("command:end", res, url, method);

      throw error;
    }

    const data: T = await res.json();

    this.emit("command:success", data, res, url, method);
    this.emit("command:end", res, url, method);

    return data;
  }

  async sessionCommand<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ) {
    return await this.command<T>(
      `/session/${this.sessionId}${command}`,
      method,
      body
    );
  }

  async findElement(by: By): Promise<string | undefined> {
    this.emit("findElement", by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      "/element",
      "POST",
      by
    );

    if (!result.value) {
      this.emit("findElement:fail", by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit("findElement:success", by, elementId);

    return elementId;
  }

  async findElementFromElement(
    fromElementId: string,
    by: By
  ): Promise<string | undefined> {
    this.emit("findElementFromElement", fromElementId, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      `/element/${fromElementId}/element`,
      "POST",
      by
    );

    if (!result.value) return;

    const elementId = result.value.ELEMENT;

    this.emit("findElementFromElement:success", fromElementId, by, elementId);

    return elementId;
  }

  async findElements(by: By): Promise<Array<string>> {
    this.emit("findElements", by);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >("/elements", "POST", by);

    if (!result.value) return [];

    const elementIds = result.value.map(v => v.ELEMENT);

    this.emit("findElements:success", by, elementIds);

    return elementIds;
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    this.emit("findElementsFromElement", by, fromElementId);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(`/element/${fromElementId}/elements`, "POST", by);

    if (!result.value) return [];

    const elementIds = result.value.map(v => v.ELEMENT);

    this.emit("findElementsFromElement:success", fromElementId, by, elementIds);

    return elementIds;
  }

  async elementText(elementId: string) {
    const result = await this.sessionCommand<CommandResponse<string>>(
      `/element/${elementId}/text`,
      "GET"
    );

    return result.value;
  }

  async clickElement(elementId: string) {
    await this.sessionCommand(`/element/${elementId}/click`, "POST");
  }

  async url(url: string) {
    await this.sessionCommand("/url", "POST", { url });
  }

  async closeWindow() {
    await this.sessionCommand("/window", "DELETE");
  }

  async sendKeysElement(elementId: string, text: string) {
    await this.sessionCommand(`/element/${elementId}/value`, "POST", {
      text,
      value: text.split("")
    });
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
