import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import {closestCoords, miningLocations, randomDirectedMovement, randomValidLoc, simpleValidLoc } from "./utils";

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

    if(this.destination === undefined) {
      // Calculate closest karbonite/fuel location.
      this.destination = closestCoords([this.me.x, this.me.y], this.karboniteLocations);
    }
    
    if(this.destination !== undefined && (this.me.x === this.destination[0] && this.me.y === this.destination[1])) {
      // If on destination
      this.destination = undefined;
      return(this.mine());
    }
    
    if(this.me.karbonite === 20 || this.me.fuel === 100) {
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log("---FULL INVENTORY, RETURNING TO BASE---");
      this.destination = closestCoords([this.me.x, this.me.y], this.storageLoc);
    }


    if(this.destination !== undefined) {
      this.log("MOVING TO DESTINATION >> >>");
      const nextMove = randomDirectedMovement(this, [this.me.x, this.me.y], this.destination);
      this.log(nextMove);
      return this.move(nextMove[0], nextMove[1]);
    } 

    if (this.me.turn % 2 === 0) {
      // return pilgrimBuild(this);
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