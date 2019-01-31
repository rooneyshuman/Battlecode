import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import { buildExtraInfoMap, MapItemInterface, miningLocations, randomValidLoc, simplePathFinder,  simpleValidLoc,  } from "./utils";

class MyRobot extends BCAbstractRobot {
  private readonly adjChoices: number[][] = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
  
  private storageLoc: number[][] = [];
  private karboniteLocations: number[][] = undefined;
  private fuelLocations: number[][] = undefined;
  private mining: boolean = false;
  private destinationQueue: number[][] = [];
  private destination: number[] = undefined;
  private prevLoc: number[] = undefined;
  private prevMove: number[] = undefined;
  
  public turn(): Action | Falsy {
    const choice: number[] = randomValidLoc(this);

    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return this.handlePilgrim();
      }
      
      case SPECS.CRUSADER: {
        // this.log(`Crusader health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PROPHET: {
        // this.log(`Prophet health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PREACHER: {
        // this.log(`Preacher health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.CASTLE: {
        return this.handleCastle();
      }
    }
  }

  private handleCastle(): Action | Falsy {
    // If castle can't build, it tries to attack
    if (this.karbonite >= 10) {
      return castleBuild(this);
    }
    const attackingCoordinates = attackFirst(this);
    if (attackingCoordinates) {
      return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
    }
  }
  
  private handlePilgrim(): Action | Falsy {
    // let action: Action | Falsy = undefined;
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }
    if(this.destination !== undefined) {
      this.log("MOVING TO DESTINATION >> >>");
      this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
      if(this.prevLoc[0] === this.me.x && this.prevLoc[1] === this.me.y) {
        return this.move(this.prevMove[0], this.prevMove[1]);
      }

      if (this.destinationQueue.length > 0) {
        const nextTile = this.destinationQueue.pop();
        const moveX = nextTile[0] - this.me.x ;
        const moveY = nextTile[1] - this.me.y;
        this.prevLoc = [this.me.x, this.me.y];
        this.prevMove = [moveX, moveY];
        return this.move(moveX, moveY);
      }

      this.destination = undefined;
    } 
    
    if(this.me.karbonite < 20 && this.me.fuel < 100) {
      const currentLoc = [this.me.x, this.me.y];
      for(const loc of this.karboniteLocations) {
        if(currentLoc[0] === loc[0] && currentLoc[1] === loc[1]) {
          this.mining = true;
          this.log(`${currentLoc} >>> Mining >>> ${loc}`);
          return(this.mine());
        }
      }

      for(const loc of this.fuelLocations) {
        if(currentLoc[0] === loc[0] && currentLoc[1] === loc[1]) {
          this.mining = true;
          this.log(`${currentLoc}>>> Mining >>> ${loc}`);
          return(this.mine());
        }
      }
    } else {
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log("---FULL INVENTORY, RETURNING TO BASE---");
      this.destination = this.storageLoc[0];
    }

    if (this.me.turn % 2 === 0) {
      return pilgrimBuild(this);
    }

    const movement = randomValidLoc(this);
    return this.move(movement[0], movement[1]);

  }

  private initializePilgrim() {
    this.log("> > > FINDING THINGS > > >")
    this.karboniteLocations = miningLocations(this.karbonite_map);
    this.fuelLocations = miningLocations(this.fuel_map);
    const visibleRobots = this.getVisibleRobots();
    const castle = visibleRobots.filter((robot) => {
      if( (robot.team === this.me.team) && (robot.unit === SPECS.CASTLE)) {
        return robot;
      }
    });

    for(const loc of castle) {
      this.storageLoc.push([loc.x, loc.y]);
    }
  }
  
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();