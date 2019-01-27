import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import { miningLocations } from "./utils";

class MyRobot extends BCAbstractRobot {
  private step = 0;
  private adjChoices = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  public turn(): Action | Falsy {
    this.step++;
    const choice: number[] = this.randomValidLoc();
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        this.log(`Pilgrim health: ${this.me.health}`);
        if (this.step % 2 === 0) {
          return pilgrimBuild(this);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.CRUSADER: {
        this.log(`Crusader health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PROPHET: {
        this.log(`Prophet health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PREACHER: {
        this.log(`Preacher health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.CASTLE: {
        // If castle can't build, it tries to attack
        if (this.karbonite >= 10) {
          return castleBuild(this);
        }
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
      }
    }
  }

  private randomValidLoc(): number[] {
    // TODO: Possibly check if a unit is in the desired space for movement?
    const mapDim = this.map[0].length
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
    } while (!this.map[this.me.y + loc[1]][this.me.x + loc[0]] && counter < this.adjChoices.length);
    if (counter >= this.adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }

  private simpleValidLoc(): number[] {
    let i = 0;
    while (!this.map[this.me.y + this.adjChoices[i][1]][this.me.x + this.adjChoices[i][0]] && i < this.adjChoices.length) {
      // Makes sure the terrain is passable.
      // this.map is indexed as [y][x]
      i++;
    }
    return this.adjChoices[i]
  }
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();