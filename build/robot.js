import { BCAbstractRobot, SPECS } from 'battlecode';

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.step = 0;
  }
  turn() {
    this.step++;
    if (this.me.unit === SPECS.CRUSADER) {
      this.log(`Crusader health: ${this.me.health}`);
      const choices = [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
      ];
      const choice = choices[Math.floor(Math.random() * choices.length)];
      return this.move(choice[0], choice[1]);
    }
    if (this.me.unit === SPECS.CASTLE) {
      this.log(`Castle health: ${this.me.health}`);
      if (this.step % 10 === 0) {
        this.log(`Building a crusader at (${this.me.x + 1}, ${this.me.y + 1})`);
        return this.buildUnit(SPECS.CRUSADER, 1, 1);
      }
    }
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
