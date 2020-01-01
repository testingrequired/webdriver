export type Using =
  | "css selector"
  | "xpath"
  | "tag name"
  | "link text"
  | "partial link text";

export class By {
  constructor(public using: Using, public value: string) {}
}
