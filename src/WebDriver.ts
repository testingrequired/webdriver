import { By } from "./By";

export default class WebDriver {
  private _sessionId?: string;

  constructor() {}

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
    return `/session/${this.sessionId}${commandPath}`;
  }

  async command<T>(url: string, verb: string, body: any): Promise<any> {}

  async findElement(by: By): Promise<string> {
    const elementId: string = await this.command<string>(
      this.commandUrl("/element"),
      "POST",
      by
    );

    return elementId;
  }

  async findElementFromElement(fromElementId: string, by: By): Promise<string> {
    const elementId: string = await this.command<string>(
      this.commandUrl(`/element/${fromElementId}/element`),
      "POST",
      by
    );

    return elementId;
  }

  async findElements(by: By): Promise<Array<string>> {
    const elementIds: Array<string> = await this.command<Array<string>>(
      this.commandUrl("/elements"),
      "POST",
      by
    );

    return elementIds;
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    const elementIds: Array<string> = await this.command<Array<string>>(
      this.commandUrl(`/element/${fromElementId}/elements`),
      "POST",
      by
    );

    return elementIds;
  }
}
