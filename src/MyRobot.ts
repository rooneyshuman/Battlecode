import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import { availableLoc, closestMiningLocation, enemyCastle, findClosestFriendlyCastles, horizontalFlip, simplePathFinder, visibleEnemy, visiblePilgrims } from "./utils";

class MyRobot extends BCAbstractRobot {
  private resourceLocation: number[] = undefined;
  private goMining: boolean = false;
  private destinationQueue: number[][] = [];
  private destination: number[] = undefined;
  private nextMove: number[] = undefined;
  private enemyCastleLoc: number[][] = [];
  private enemyCastleNum: number = 0;
  private runPathAgain: number = 0;

  public turn(): Action | Falsy {
    const choice: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);

    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return this.handlePilgrim();
      }

      case SPECS.CRUSADER: {
        // this.log(`Crusader health: ${this.me.health}`);

        // move torwards enemy castle
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PROPHET: {
        if (this.me.turn === 1) {
          const horizontal = horizontalFlip(this);
          const visibleRobots = this.getVisibleRobots();
          const listLenght = visibleRobots.length;
          let i;
          for (i = 0; i < listLenght; ++i) {
            const rob = visibleRobots[i];
            if (rob.unit === SPECS.CASTLE) {
              this.enemyCastleLoc.push(enemyCastle(rob.x, rob.y, this.map.length, this, horizontal));
              this.destination = this.enemyCastleLoc[this.enemyCastleNum];
              this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
              this.log("CASTLE LOCATION - PROPHET" + this.enemyCastleLoc[this.enemyCastleNum][0] + ", " + this.enemyCastleLoc[this.enemyCastleNum][1]);
            }
          }
        }

        if (this.runPathAgain > 0) {
          this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
          this.runPathAgain--;
          return this.move(choice[0], choice[1]);
        }

        // this.log(`Prophet health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }

        if (this.enemyCastleLoc !== null && (this.destinationQueue !== undefined && this.destinationQueue.length !== 0)) {
          const toMove = rushCastle(this, this.destination, this.destinationQueue);
          if (toMove === null) {
            this.runPathAgain = 1;
          }
          else {
            return this.move(toMove[0], toMove[1]);
          }
        }

        if (this.destinationQueue.length === 0) {
          this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
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
        if (this.me.turn === 1) {
          const horizontal = horizontalFlip(this);
          this.enemyCastleLoc.push(enemyCastle(this.me.x, this.me.y, this.map.length, this, horizontal));
          this.log("CASTLE LOCATION" + this.enemyCastleLoc[this.enemyCastleNum][0] + ", " + this.enemyCastleLoc[this.enemyCastleNum][1]);
        }
        return this.handleCastle();
      }
    }
  }

  private handleCastle(): Action | Falsy {
    // Castle build pilgrims at first 2 turns
    if (this.me.turn < 3) {
      const buildLoc: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
      // Have each castle build pilgrims in first 2 turns
      if (buildLoc){
        this.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${this.me.turn})`);
        return this.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
      }
    }

    // Check for enemies first
    if (visibleEnemy(this.getVisibleRobots(), this.me.team)){
      const attackCoords = attackFirst(this);
      if (attackCoords) {
        this.log(`Visible enemy robot in attack range at (${attackCoords[0]}, ${attackCoords[0]})`);
        this.log(`ATTACKING!`);
        return this.attack(attackCoords[0], attackCoords[1]);
      }
      this.log(`Visible enemy robot is out of attack range`);
    }
    // Check if enough karb to build
    if (this.karbonite >= 10) {
      this.log(`Enough karb to build..`)
      return castleBuild(this);
    }
  }

  private handlePilgrim(): Action | Falsy {
    this.log(" > > > PILGRIM TIME > > >");
    // let action: Action | Falsy = undefined;
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }

    if (this.destination === undefined) {
      // Calculate closest karbonite/fuel location.
      this.log(`MY DEST IS ${this.resourceLocation}`)
      this.destination = this.resourceLocation;
      this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
      this.nextMove = this.destinationQueue.pop();
      this.goMining = true;
      this.log(` > > > CLOSEST MINING SPOT AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`);
    }

    let full;

    if (this.me.karbonite === 20 || this.me.fuel === 100) {
      full = true;
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log("---FULL INVENTORY, RETURNING TO BASE---");
      this.goMining = false;
      const closestCastle = findClosestFriendlyCastles(this);
      const dx = closestCastle[0] - this.me.x;
      const dy = closestCastle[1] - this.me.y;
      const dist = Math.pow(dx, 2) + Math.pow(dy, 2);

      // If castle is in adjacent square, give resources
      if (dist <= 2) {
        this.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
        return this.give(dx, dy, this.me.karbonite, this.me.fuel);
      }
      
      // Not near castle, set destination queue to nav to base
      const validLoc = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
      this.destination = [closestCastle[0] + validLoc[0], closestCastle[1] + validLoc[1]];
      this.destinationQueue = simplePathFinder(this.map, [this.me.x, this.me.y], this.destination);
      this.nextMove = this.destinationQueue.pop();
      this.log(` > > > MY LOCATION (${this.me.x}, ${this.me.y})> > >`);
      this.log(` > > > CLOSEST CASTLE AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`); 
    }

    // Mine or set mining location to destination if not full and at location
    if (this.me.x === this.destination[0] && this.me.y === this.destination[1] && !full) {
      // If on destination and is going mining, mine.
      if (this.goMining === true) {
        this.log("CURRENTLY MINING");
        return (this.mine());
      }
      this.destination = undefined;
    }

    if (this.me.turn % 2 === 0) {
      // return pilgrimBuild(this);
    }

    // Move to destination
    if ((this.me.x !== this.nextMove[0]) && (this.me.y !== this.nextMove[1])) {
      // TODO: Possibly move this into a separate function?
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > ME ${this.me.x}, ${this.me.y} > > >`)
      this.log(`> > > nextMove ${this.nextMove} > > >`)
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      this.log(`> > > DEST ${this.destination} > > >`)
      return this.move(moveX, moveY);
    }

    if (this.destinationQueue.length !== 0 && ((this.me.x === this.nextMove[0]) && (this.me.y === this.nextMove[1]))) {
      // If the destination queue has coordinates and my current location is the 
      // same as my next move's location, then pop next destination and set nextMove to it.
      this.nextMove = this.destinationQueue.pop();
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      return this.move(moveX, moveY);
    }
  }

  // Sets pilgrims' initial mining job
  private initializePilgrim() {
    this.log("> > > FINDING THINGS > > >")
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    this.resourceLocation = (visiblePilgrims(this) <= 1) ?
      closestMiningLocation([this.me.x, this.me.y], this.karbonite_map) :
      closestMiningLocation([this.me.x, this.me.y], this.fuel_map);
    this.log(`VISPILGS < 1: ${visiblePilgrims(this) < 1} RESRC LOC: ${this.resourceLocation}, pilnum${visiblePilgrims(this)}`);
  }
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();