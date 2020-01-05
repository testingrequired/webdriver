import { By } from "./By";

describe("By", () => {
  const expectedSelector = "expectedSelector";

  describe("css", () => {
    it("should use correct strategy", () => {
      expect(By.css(expectedSelector).using).toBe("css selector");
    });

    it("should use selector", () => {
      expect(By.css(expectedSelector).value).toBe(expectedSelector);
    });
  });

  describe("xpath", () => {
    it("should use correct strategy", () => {
      expect(By.xpath(expectedSelector).using).toBe("xpath");
    });

    it("should use selector", () => {
      expect(By.xpath(expectedSelector).value).toBe(expectedSelector);
    });
  });

  describe("tagName", () => {
    it("should use correct strategy", () => {
      expect(By.tagName(expectedSelector).using).toBe("tag name");
    });

    it("should use selector", () => {
      expect(By.tagName(expectedSelector).value).toBe(expectedSelector);
    });
  });

  describe("linkText", () => {
    it("should use correct strategy", () => {
      expect(By.linkText(expectedSelector).using).toBe("link text");
    });

    it("should use selector", () => {
      expect(By.linkText(expectedSelector).value).toBe(expectedSelector);
    });
  });

  describe("partialLinkText", () => {
    it("should use correct strategy", () => {
      expect(By.partialLinkText(expectedSelector).using).toBe(
        "partial link text"
      );
    });

    it("should use selector", () => {
      expect(By.partialLinkText(expectedSelector).value).toBe(expectedSelector);
    });
  });
});
