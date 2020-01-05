export type Using =
  | "css selector"
  | "xpath"
  | "tag name"
  | "link text"
  | "partial link text";

export class By {
  constructor(public using: Using, public value: string) {}

  static css(selector: string) {
    return new By("css selector", selector);
  }

  static xpath(selector: string) {
    return new By("xpath", selector);
  }

  static tagName(selector: string) {
    return new By("tag name", selector);
  }

  static linkText(selector: string) {
    return new By("link text", selector);
  }

  static partialLinkText(selector: string) {
    return new By("partial link text", selector);
  }
}
