import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { castleBuild, pilgrimBuild, UnitCountInterface } from './BuildUnits';
import { handleProphet } from './Prophet';
import { availableLoc, closestMiningLocation, enemyCastle, findClosestFriendlyCastles, findResources, horizontalFlip, simplePathFinder, visibleEnemy, visiblePilgrims } from "./utils";

// Temporarily placed here.
const KARBONITE = 1;
const FUEL = 2;

class MyRobot extends BCAbstractRobot {
	private destinationQueue: number[][];
	private destination: number[];
	private enemyCastleLoc: number[][];
	private enemyCastleNum: number;
	private runPathAgain: number;
	private nextMove: number[];
	private friendlyCastleLoc: number[][];
	private checkerBoardSpot: number[];
  private visitedBots: number[];
  private originalCastleLoc: number[] = undefined;
  private resourceToMine = 0;
  private resourceLocation: number[] = undefined;
  private goMining: boolean = false;
  private unitCount: UnitCountInterface = {
    prophet: 0,
    pilgrim: 0,
    crusader: 0,
    preacher: 0
  }

	constructor() {
		super();
		this.destinationQueue = [];
		this.destination = undefined;
		this.enemyCastleLoc = [];
		this.enemyCastleNum = 0;
		this.runPathAgain = 0;
		this.nextMove = undefined;
		this.friendlyCastleLoc = [];
		this.checkerBoardSpot = undefined;
    this.visitedBots = [];
	}


  public turn(): Action | Falsy {

    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return this.handlePilgrim();
      }

      case SPECS.CRUSADER: {
        const choice: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
        // this.log(`Crusader health: ${this.me.health}`);

        // move torwards enemy castle
        const attackingCoordinates = attackFirst(this);

        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }

      case SPECS.PROPHET: {
        this.log("> > PROPHET > >")
        return handleProphet(this);
      }

      case SPECS.PREACHER: {
        // this.log(`Preacher health: ${this.me.health}`);
        const choice: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
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
          this.enemyCastleLoc.push(enemyCastle([this.me.x, this.me.y], this.map, horizontal));
          this.log("CASTLE LOCATION" + this.enemyCastleLoc[this.enemyCastleNum][0] + ", " + this.enemyCastleLoc[this.enemyCastleNum][1]);
        }
        return this.handleCastle();
      }
    }
  }

  private handleCastle(): Action | Falsy {
    // Castle build pilgrims at first 2 turns
    if (this.me.turn < 3) {
      this.log(`TURN: ${this.me.turn}`)
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
      return castleBuild(this, this.unitCount);
    }
  }

  private handlePilgrim(): Action | Falsy {
    this.log(" > > > PILGRIM TIME > > >");
    // let action: Action | Falsy = undefined;
    const visibleRobots = this.getVisibleRobotMap();
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }
    if (this.destination === undefined) {
      if(this.resourceLocation === undefined) {
        this.findDiffMining();
      }
      this.log(`MY DEST IS ${this.resourceLocation}`)
      this.destination = this.resourceLocation;
      const robotMap = this.getVisibleRobotMap();
      this.destinationQueue = simplePathFinder(this.map, robotMap, [this.me.x, this.me.y], this.destination);
      this.goMining = true;
      this.log(` > > > CLOSEST MINING SPOT AT ${this.destination}> > >`);
    }

    let full;
	
    if (this.me.karbonite === 20 || this.me.fuel === 100) {
      full = true;
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log("---FULL INVENTORY, RETURNING TO BASE---");
      this.goMining = false;
      let closestCastle = findClosestFriendlyCastles(this);
      if (closestCastle === undefined) {
        closestCastle = this.originalCastleLoc;
      }
      const dx = closestCastle[0] - this.me.x;
      const dy = closestCastle[1] - this.me.y;
      const dist = Math.pow(dx, 2) + Math.pow(dy, 2);

      // If castle is in adjacent square, give resources
      if (dist <= 2) {
        this.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
        return this.give(dx, dy, this.me.karbonite, this.me.fuel);
      }
      
      // Not near castle, set destination queue to nav to base
      const validLoc = availableLoc(this.me.x, this.me.y, visibleRobots, this.map);
      this.destination = [closestCastle[0] + validLoc[0], closestCastle[1] + validLoc[1]];
      this.destinationQueue = simplePathFinder(this.map, visibleRobots,[this.me.x, this.me.y], this.destination);
      this.log(` > > > MY LOCATION (${this.me.x}, ${this.me.y})> > >`);
      this.log(` > > > CLOSEST CASTLE AT ${this.destination}> > >`);
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

    if(visibleRobots[this.destination[1]][this.destination[0]] > 0) {
      this.log("I AM A DUMB ROBOT")
      this.findDiffMining();
      // TODO: Make path finder faster
      // TODO: Keep track of occupied mining locations.
      // this.destinationQueue = simplePathFinder(this.map, visibleRobots,[this.me.x, this.me.y], this.destination);
    }

    // Move to destination
    if (this.destinationQueue.length !== 0) {
      // If the destination queue has coordinates and my current location is the 
      // same as my next move's location, then pop next destination and set nextMove to it.
      this.nextMove = this.destinationQueue.pop();

      if(visibleRobots[this.nextMove[1]][this.nextMove[0]] > 0) {
        this.log("THERE'S A DUMB ROBOT IN THE WAY");
        this.destinationQueue = simplePathFinder(this.map, visibleRobots,[this.me.x, this.me.y], this.destination);
        this.log(`Destination: ${this.destination}, QUEUE: ${this.destinationQueue.reverse()}`)
      }

      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > Next Move: ${this.nextMove} > > >`)
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      return this.move(moveX, moveY);
    }
  }

  // Sets pilgrims' initial mining job
  private initializePilgrim() {
    this.log("> > > FINDING THINGS > > >");
    const visibleRobots = this.getVisibleRobotMap();
    this.originalCastleLoc = findClosestFriendlyCastles(this);
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    this.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(this)}`)
    if (visiblePilgrims(this) % 2 === 0 ) {
      this.resourceLocation = closestMiningLocation([this.me.x, this.me.y], this.karbonite_map, visibleRobots)
      this.resourceToMine = KARBONITE;
    }
    else {
      this.resourceLocation = closestMiningLocation([this.me.x, this.me.y], this.fuel_map, visibleRobots);
      this.resourceToMine = FUEL;
    }
    
    this.log(`VISPILGS < 1: ${visiblePilgrims(this) < 1} RESRC LOC: ${this.resourceLocation}, pilnum${visiblePilgrims(this)}`);
  }

  private findDiffMining() {
    // It's like initializePilgrim
    const visibleRobots = this.getVisibleRobotMap();
    this.resourceToMine = (this.resourceToMine === KARBONITE) ? FUEL : KARBONITE;
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    this.resourceLocation = (this.resourceToMine === KARBONITE) ?
      closestMiningLocation([this.me.x, this.me.y], this.karbonite_map, visibleRobots) :
      closestMiningLocation([this.me.x, this.me.y], this.fuel_map, visibleRobots);
  }

}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();