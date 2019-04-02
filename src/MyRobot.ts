import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { handleCastle } from './Castle';
import { handleCrusader } from './Crusader';
import { handlePilgrim } from './Pilgrim';
import { handleProphet } from './Prophet';
import { availableLoc, closestMiningLocation, enemyCastle, findClosestFriendlyCastles, findResources, horizontalFlip, simplePathFinder, visibleEnemy, visiblePilgrims } from "./utils";

class MyRobot extends BCAbstractRobot {
  private destinationQueue: number[][];
  private destination: number[];
  private enemyCastleLoc: number[][];
  private enemyCastleNum: number;
  private runPathAgain: number;
  private rush: boolean = false;
  private nextMove: number[];
  private friendlyCastleLoc: number[][];
  private checkerBoardSpot: number[];
  private visitedBots: number[];
  private originalCastleLoc: number[] = undefined;
  private resourceToMine = 0;
  private resourceLocation: number[] = undefined;
  private goMining: boolean = false;
  private signalQueue: number[] = [];
  private assignResCount: object;
  private resourceSpots: number;
  private resourceLocations: number[][];
  private crusaderCount: number = 0;

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
    this.assignResCount = {
      fuel: 0,
      karb: 0
    }
    this.resourceSpots = 0;
  }


  public turn(): Action | Falsy {

    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return handlePilgrim(this);
      }

      case SPECS.CRUSADER: {
        this.log(" > > CRUSADER > >");
        return handleCrusader(this);
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
          const horizontal = horizontalFlip(this.map);
          this.enemyCastleLoc.push(enemyCastle([this.me.x, this.me.y], this.map, horizontal));
          this.log("CASTLE LOCATION" + this.enemyCastleLoc[this.enemyCastleNum][0] + ", " + this.enemyCastleLoc[this.enemyCastleNum][1]);
        }
        return handleCastle(this);
      }
    }
  }
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();