import { BCAbstractRobot, SPECS } from 'battlecode';

class MyRobot extends BCAbstractRobot {
  private step = 0;

  public turn(): Action | Falsy {
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
    if (this.me.unit === SPECS.PILGRIM) {
      this.log(`Pilgrim health: ${this.me.health}`);
    }

    if (this.me.unit === SPECS.PREACHER) {
      this.log(`Preacher health: ${this.me.health}`);
    }

    if (this.me.unit === SPECS.CRUSADER) {
      this.log(`Crusader health: ${this.me.health}`);

      const choice = adjChoices[Math.floor(Math.random() * adjChoices.length)];
      return this.move(choice[0], choice[1]);
    }

    if (this.me.unit === SPECS.CASTLE) {
      this.log(`Castle health: ${this.me.health}`);

      if (this.step % 10 === 0) {
        let i = 0;
        while (
          !this.map[adjChoices[i][1]][adjChoices[i][0]] &&
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
