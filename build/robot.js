import { BCAbstractRobot, SPECS } from 'battlecode';

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.step = 0;
    this.adjChoices = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
  }
  turn() {
    this.step++;
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        this.log('Pilgrim');
        break;
      }
      case SPECS.PREACHER: {
        this.log('Preacher');
        // Add unit handling in another function
        break;
      }
      case SPECS.CRUSADER: {
        // this.log(`Crusader health: ${this.me.health}`);
        const choice = this.randomValidLoc();
        return this.move(choice[0], choice[1]);
      }
      case SPECS.CASTLE: {
        return this.handleCastle();
      }
    }
  }
  handleCastle() {
    // this.log(`Castle health: ${this.me.health}`);
    if (this.step % 10 === 0) {
      const buildLoc = this.simpleValidLoc();
      this.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]})`);
      return this.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
    }
  }
  randomValidLoc() {
    // FIXME: Fix for map edges.
    const mapDim = this.map[0].length;
    let rand = Math.floor(Math.random() * this.adjChoices.length);
    let loc = this.adjChoices[rand];
    let counter = 0;
    do {
      if (this.me.y + loc[1] >= mapDim) {
        loc[1] = -1;
      }
      if (this.me.y + loc[1] < 0) {
        loc[1] = 1;
      }
      if (this.me.x + loc[0] >= mapDim) {
        loc[0] = -1;
      }
      if (this.me.x + loc[0] < 0) {
        loc[0] = 1;
      }
      rand = (rand + 1) % this.adjChoices.length;
      counter++;
    } while (
      !this.map[this.me.y + loc[1]][this.me.x + loc[0]] &&
      counter < this.adjChoices.length
    );
    if (counter >= this.adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }
  simpleValidLoc() {
    let i = 0;
    while (
      !this.map[this.me.y + this.adjChoices[i][1]][
        this.me.x + this.adjChoices[i][0]
      ] &&
      i < this.adjChoices.length
    ) {
      // Makes sure the terrain is passable.
      // this.map is indexed as [y][x]
      i++;
    }
    return this.adjChoices[i];
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
