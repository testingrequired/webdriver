import Browser from "./Browser";
import { By } from "./By";

export default class WebElement {
  constructor(
    public readonly browser: Browser,
    public readonly by: By,
    public elementId: string
  ) {}
}
