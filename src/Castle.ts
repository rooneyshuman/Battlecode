import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { availableLoc, visibleEnemy, visiblePilgrims, findResources, sortByClosest } from "./utils";
import { constructCoordMessage } from './Communication';

export function handleCastle(self : any): Action | Falsy {
  if (self.me.turn === 1) {
    initializeCastle(self);
  }
  if(self.signalQueue.length > 0) {
      // self.signal(self.signalQueue[0], 1);
      self.log(`My Signal: ${self.signalQueue[0]}`);
  }

  // Castle build pilgrims at first 2 turns
  if (self.me.turn < 3) {
    self.signalQueue.push(orderPilgrim(self));
    self.log(`SIGNAL: ${self.signalQueue[0]}`);
    self.signal(self.signalQueue[0], 1); // Temporary
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
    // Have each castle build pilgrims in first 2 turns
    if (buildLoc){
      self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
      return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
  }

  // Check for enemies first
  if (visibleEnemy(self.getVisibleRobots(), self.me.team)){
    const attackCoords = attackFirst(self);
    if (attackCoords) {
      self.log(`Visible enemy robot in attack range at (${attackCoords[0]}, ${attackCoords[0]})`);
      self.log(`ATTACKING!`);
      return self.attack(attackCoords[0], attackCoords[1]);
    }
    self.log(`Visible enemy robot is out of attack range`);
  }
  // Check if enough karb to build
  if (self.karbonite >= 10) {
    self.log(`Enough karb to build..`)
    return castleBuild(self);
  }
}

  export function castleBuild(self: any): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap, self.map);

    self.log(`Castle health: ${self.me.health}`);
    // TODO: Check for confirmation signal from pilgrim, then shift signalQueue.
    if(self.signalQueue.length > 0) {
      self.signal(self.signalQueue[0], 1);
      self.log(`SIGNALING: ${self.signalQueue[0]}`);
    }

     // Pilgrims have been killed off, build new ones
     const pilgrimNum = visiblePilgrims(self)
     if (pilgrimNum < 2 && buildLoc) {
      if (self.signalQueue.length > 0) {
        self.signalQueue.shift(); // Temporary
      }
      self.signalQueue.append(orderPilgrim(self));
      self.log(`PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
      return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and if enough karb for prophet
    if (self.karbonite >= 25 && buildLoc) {
        // Temporarily only build 1 prophet
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and enough karb for pilgrim 
	/*
    else if (self.karbonite >= 10 && buildLoc && (self.me.turn % 1000)){
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
	*/
}

function initializeCastle(self: any) {
  self.log("CaStLe InItIaLiZaTiOn");
  self.log("F I N D I N G - - R E S O U R C E S");
  const resourceLocations = findResources(self.karbonite_map, self.fuel_map);
  const myLoc = [self.me.x, self.me.y];
  self.karboniteLocs = sortByClosest(myLoc, resourceLocations[0]);
  self.fuelLocs = sortByClosest(myLoc, resourceLocations[1]);
  self.log(`CLOSEST: ${self.karboniteLocs[0]}`);
}

function orderPilgrim(self: any) {
  // Broadcast a resource location to a pilgrim.
  // Pilgrim should only listen to broadcasts once.
  // Only build as many pilgrims as there are resources (or # resources / 2)
  // Compare resource lengths. Use the bigger one. If equal, choose karbonite.
  // TODO: Make sure to replenish mining locations if a pilgrim dies.
  let resourceLoc;
  if (self.karboniteLocs.length === self.fuelLocs.length) {
    resourceLoc = self.karboniteLocs.shift();
  }
  else {
    if(self.karboniteLocs.length > self.fuelLocs.length) {
      resourceLoc = self.karboniteLocs.shift();
    }
    else {
      resourceLoc = self.fuelLocs.shift();
    }
  }
  return constructCoordMessage(resourceLoc);
}