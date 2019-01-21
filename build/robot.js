import { BCAbstractRobot, SPECS } from 'battlecode';

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.step = 0;
  }
  turn() {
    const adjChoices = [
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
    if (this.me.unit === SPECS.PILGRIM);
    if (this.me.unit === SPECS.PREACHER);
    if (this.me.unit === SPECS.CRUSADER);
    if (this.me.unit === SPECS.CASTLE) {
      // this.log(`Castle health: ${this.me.health}`);
      if (this.step % 10 === 0) {
        let i = 0;
        while (
          !this.map[this.me.y + adjChoices[i][1]][
            this.me.x + adjChoices[i][0]
          ] &&
          i < adjChoices.length
        ) {
          // Makes sure the terrain is passable.
          // this.map is indexed as [y][x]
          i++;
        }
        this.log(
          `Building a crusader at (${this.me.x + adjChoices[i][0]}, ${this.me
            .y + adjChoices[i][1]})`,
        );
        return this.buildUnit(
          SPECS.CRUSADER,
          adjChoices[i][0],
          adjChoices[i][1],
        );
      }
    }
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
