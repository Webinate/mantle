import { generateRandString } from '../../utils/utils';
import { sleep } from '.';

export class Queue {
  public line: string[];

  constructor() {
    this.line = [];
  }

  register() {
    const id = generateRandString(12);
    this.line.push(id);
    return id;
  }

  async waitForTurn(id: string) {
    while (id !== this.line[0]) await sleep(30);

    return;
  }

  processNext() {
    this.line.shift();
  }
}
