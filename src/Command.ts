export class Command {
  constructor(
    public readonly endpoint: string,
    public readonly method: string,
    public readonly body?: any
  ) {}
}
