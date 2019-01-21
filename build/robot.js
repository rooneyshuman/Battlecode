import { BCAbstractRobot, SPECS } from 'battlecode';

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.step = 0;
  }
  turn() {
    const adj_choices = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
    this.step++;
    if (this.me.unit === SPECS.PILGRIM) {
      this.log(`Pilgrim health: ${this.me.health}`);
    }
    if (this.me.unit === SPECS.PREACHER) {
      this.log(`Preacher health: ${this.me.health}`);
    }
    if (this.me.unit === SPECS.CRUSADER) {
      this.log(`Crusader health: ${this.me.health}`);
      const choice =
        adj_choices[Math.floor(Math.random() * adj_choices.length)];
      return this.move(choice[0], choice[1]);
    }
    if (this.me.unit === SPECS.CASTLE) {
      this.log(`Castle health: ${this.me.health}`);
      if (this.step % 10 === 0) {
        let i = 0;
        while (
          !this.map[adj_choices[i][1]][adj_choices[i][0]] &&
          i < adj_choices.length
        ) {
          // Makes sure the terrain is passable.
          // this.map is indexed as [y][x]
          i++;
        }
        this.log(
          `Building a crusader at (${this.me.x + adj_choices[i][0]}, ${this.me
            .y + adj_choices[i][1]})`,
        );
        return this.buildUnit(
          SPECS.CRUSADER,
          adj_choices[i][0],
          adj_choices[i][1],
        );
      }
    }
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
