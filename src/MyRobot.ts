import { BCAbstractRobot, SPECS } from 'battlecode';

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
    switch(this.me.unit){
      case SPECS.PILGRIM: {
        this.log("Pilgrim");
      }
      
      case SPECS.PREACHER: {
        this.log("Preacher");
        // Add unit handling in another function
      }
      case SPECS.CRUSADER: {
        // this.log(`Crusader health: ${this.me.health}`);

        const choice = this.adjChoices[Math.floor(Math.random() * this.adjChoices.length)];
        // return this.move(choice[0], choice[1]);
      }

      case SPECS.CASTLE: {
        this.handleCastle()
      }
    }
  }

  private handleCastle(): Action | Falsy {
    // this.log(`Castle health: ${this.me.health}`);
    if (this.step % 10 === 0) {
      const buildLoc: number[] = this.unitBuildLocation()
      this.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]})`,);
      return this.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
    }
  }

  private unitBuildLocation(): number[] {
    let i = 0;
    while (!this.map[this.me.y + this.adjChoices[i][1]][this.me.x + this.adjChoices[i][0]] && i < this.adjChoices.length) {
      // Makes sure the terrain is passable.
      // TODO: Make sure a unit is not already on that space.
      // this.map is indexed as [y][x]
      i++;
    }
    return this.adjChoices[i]
  }
}


// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
