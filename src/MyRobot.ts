import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import {closestCoords, closestMiningLocation, enemyCastle, findClosestFriendlyCastles, horizontalFlip, randomValidLoc, simplePathFinder, simpleValidLoc} from "./utils";

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
  private karboniteLocation: number[] = undefined;
  private fuelLocation: number[] = undefined;
  private goMining: boolean = false;
  private destinationQueue: number[][] = [];
  private destination: number[] = undefined;
  private nextMove: number[] = undefined;
  
  public turn(): Action | Falsy {
    const choice: number[] = randomValidLoc(this);
	const enemyCastleLocation = [];

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
		// get castle coordinates
		if(this.me.turn === 1)
		{
			const horizontal = horizontalFlip(this); 
			enemyCastleLocation.push(enemyCastle(this.me.x, this.me.y, this.map.length, this, horizontal));
			this.log("CASTE LOCATION" + enemyCastleLocation[0][0] + ", " + enemyCastleLocation[0][1]);
		}
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
    this.log(" > > > PILGRIM TIME > > >");
    // let action: Action | Falsy = undefined;
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }

    if(this.destination === undefined) {
      // Calculate closest karbonite/fuel location.
      this.log(" > > > FINDING CLOSEST MINING SPOT > > >");
      this.destination = this.karboniteLocation;
      this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
      this.nextMove = this.destinationQueue.pop();
      this.goMining = true;
      this.log(` > > > CLOSEST MINING SPOT AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`);
    }

    if(this.me.karbonite === 20 || this.me.fuel === 100) {
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log("---FULL INVENTORY, RETURNING TO BASE---");
      this.goMining = false;
      const closestCastle = findClosestFriendlyCastles(this);
      const validLoc = simpleValidLoc(this);
      this.destination = [closestCastle[0] + validLoc[0], closestCastle[1] + validLoc[1]];
    }
    
    if(this.me.x === this.destination[0] && this.me.y === this.destination[1]) {
      // If on destination and is going mining, mine.
      if(this.goMining === true) {
        this.log("CURRENTLY MINING");
        return(this.mine());
      }
      this.destination = undefined;
    }

    if (this.me.turn % 2 === 0) {
      // return pilgrimBuild(this);
    }

    if((this.me.x !== this.nextMove[0]) && (this.me.y !== this.nextMove[1])) {
      // TODO: Possibly move this into a separate function?
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > ME ${this.me.x}, ${this.me.y} > > >`)
      this.log(`> > > nextMove ${this.nextMove} > > >`)
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      this.log(`> > > DEST ${this.destination} > > >`)
      return this.move(moveX, moveY);
    }

    if(this.destinationQueue.length !== 0 && ((this.me.x === this.nextMove[0]) && (this.me.y === this.nextMove[1]))) {
      // If the destination queue has coordinates and my current location is the 
      // same as my next move's location, then pop next destination and set nextMove to it.
      this.nextMove = this.destinationQueue.pop();
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      return this.move(moveX, moveY);
    }
  }

  private initializePilgrim() {
    this.log("> > > FINDING THINGS > > >")
    this.karboniteLocation = closestMiningLocation([this.me.x, this.me.y], this.karbonite_map);
    this.fuelLocation = closestMiningLocation([this.me.x, this.me.y], this.fuel_map);
    this.log(`KARB LOC: ${this.karboniteLocation}`);
  }
  
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();