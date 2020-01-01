import fetch from "node-fetch";
import { By } from "./By";

export default class WebDriver {
  private _sessionId?: string;

  constructor(private options: WebdriverOptions = {}) {}

  get sessionId() {
    return this._sessionId;
  }

  async newSession() {
    this._sessionId = "";
  }

  async deleteSession() {
    delete this._sessionId;
  }

  commandUrl(commandPath: string): string {
    return `${this.options.remoteUrl}/session/${this.sessionId}${commandPath}`;
  }

  async command<T>(command: string, method: string, body: any): Promise<T> {
    const url = this.commandUrl(command);
    const res = await fetch(url, { method, body: JSON.stringify(body) });

    const data: T = await res.json();

    return data;
  }

  async findElement(by: By): Promise<string> {
    const result = await this.command<FindElementResult>(
      "/element",
      "POST",
      by
    );

    debugger;

    return result.value.ELEMENT;
  }

  async findElementFromElement(fromElementId: string, by: By): Promise<string> {
    const result = await this.command<FindElementResult>(
      `/element/${fromElementId}/element`,
      "POST",
      by
    );

    return result.value.ELEMENT;
  }

  async findElements(by: By): Promise<Array<string>> {
    const result = await this.command<FindElementsResult>(
      "/elements",
      "POST",
      by
    );

    return result.value.map(v => v.ELEMENT);
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    const result = await this.command<FindElementsResult>(
      `/element/${fromElementId}/elements`,
      "POST",
      by
    );

    return result.value.map(v => v.ELEMENT);
  }

  async url(url: string) {
    await this.command<UrlResult>("/url", "POST", { url });
  }
}

interface WebdriverOptions {
  remoteUrl?: string;
}

interface FindElementResult {
  value: { ELEMENT: string };
}

interface FindElementsResult {
  value: Array<{ ELEMENT: string }>;
}

interface UrlResult {
  data: string;
}
