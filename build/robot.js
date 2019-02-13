import { SPECS, BCAbstractRobot } from 'battlecode';

function attackFirst(self) {
  // Get all visible robots within the robots vision radius
  const visibleRobots = self.getVisibleRobots();
  // Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range\
  const listLength = visibleRobots.length;
  // let x = 0; // keep track of number of robots in attackableRobots array
  let i;
  const robotToAttack = new Array(2);
  let priorityRobot = -1;
  for (i = 0; i < listLength; ++i) {
    const rob = visibleRobots[i];
    // Check if the robot just showed up because of radio broadcast
    if (!self.isVisible(rob)) {
      continue;
    }
    // Check if robot is friendly
    if (self.me.team === rob.team) {
      continue;
    }
    self.log('ROBOT: ' + rob.id + ' is an enemy within vision');
    const dist =
      Math.pow(rob.x - self.me.x, 2) + Math.pow(rob.y - self.me.y, 2);
    if (
      SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist &&
      dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1]
    ) {
      self.log('CAN ATTACK ROBOT:' + rob.id);
      // the priority of the robot that is within attacking vision if it is higher than the current one switch over to that robot
      let priority = 0;
      switch (rob.unit) {
        case SPECS.PILGRIM: {
          priority = 0;
        }
        case SPECS.CRUSADER: {
          priority = 2;
        }
        case SPECS.CASTLE: {
          priority = 1;
        }
        case SPECS.PROPHET: {
          priority = 4;
        }
        case SPECS.PREACHER: {
          priority = 3;
        }
      }
      if (priority > priorityRobot) {
        robotToAttack[0] = rob.x - self.me.x;
        robotToAttack[1] = rob.y - self.me.y;
        priorityRobot = priority;
      }
    }
  }
  if (priorityRobot === -1) {
    return null;
  }
  return robotToAttack;
}
/**
 * Rushes robot castle
 * @param self
 * @param dest
 * @param destQ
 */
function rushCastle(self, dest, destQ) {
  let nextMove;
  const toMove = new Array(2);
  nextMove = destQ.pop();
  self.log('LOOOK HERE' + nextMove[0] + ', ' + nextMove[1]);
  self.log('DDSADASD ' + self.me.x + ', ' + self.me.y);
  if (
    destQ.length !== 0 &&
    (self.me.x === nextMove[0] && self.me.y === nextMove[1])
  ) {
    // If the destination queue has coordinates and my current location is the
    // same as my next move's location, then pop next destination and set nextMove to it.
    nextMove = destQ.pop();
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    const visibleRobots = self.getVisibleRobots();
    const listLength = visibleRobots.length;
    let i;
    for (i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.x === nextMove[0] && rob.y === nextMove[1]) {
        return null;
      }
    }
    self.log(`* * * * * MOVING ${moveX}, ${moveY} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    //return self.move(moveX, moveY);
  } else {
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    const visibleRobots = self.getVisibleRobots();
    const listLength = visibleRobots.length;
    let i;
    for (i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.x === nextMove[0] && rob.y === nextMove[1]) {
        return null;
      }
    }
    self.log(`**** ME ${self.me.x}, ${self.me.y} > > >`);
    self.log(`***** nextMove ${nextMove} > > >`);
    self.log(`*(**** MOVING ${moveX}, ${moveY} > > >`);
    self.log(`****DEST ${dest} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    //return self.move(moveX, moveY);
  }
}

class PriorityQueue {
  constructor(comparator = (a, b) => a.priority > b.priority) {
    this.top = 0;
    this.parent = i => ((i + 1) >>> 1) - 1;
    this.left = i => (i << 1) + 1;
    this.right = i => (i + 1) << 1;
    this.heap = [];
    // TODO: use the heuristic function for comparison(?)
    this.comparator = comparator;
  }
  size() {
    return this.heap.length;
  }
  insert(...values) {
    values.forEach(value => {
      this.heap.push(value);
      this.sortUp();
    });
  }
  empty() {
    this.heap = [];
  }
  peek() {
    return this.heap[this.top];
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this.top) {
      this.swap(this.top, bottom);
    }
    this.heap.pop(); // Literally remove the item from the array.
    this.sortDown();
    return poppedValue;
  }
  replace(val) {
    const replacedValue = this.peek();
    this.heap[this.top] = val;
    this.sortDown();
    return replacedValue;
  }
  greater(i, j) {
    return this.comparator(this.heap[i], this.heap[j]);
  }
  lesser(i, j) {
    return !this.comparator(this.heap[i], this.heap[j]);
  }
  sortUp() {
    let node = this.size() - 1;
    while (node > this.top && this.lesser(node, this.parent(node))) {
      const parent = this.parent(node);
      this.swap(node, parent);
      node = parent;
    }
  }
  sortDown() {
    let node = this.top;
    while (
      (this.left(node) < this.size() && this.lesser(this.left(node), node)) ||
      (this.right(node) < this.size() && this.lesser(this.right(node), node))
    ) {
      const minChild =
        this.right(node) < this.size() &&
        this.lesser(this.right(node), this.left(node))
          ? this.right(node)
          : this.left(node);
      this.swap(node, minChild);
      node = minChild;
    }
  }
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

const adjChoices = [
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
];
/**
 * Finds an in-bounds open location adjacent to our robot
 * @param { number } our x-coord, { number } our y-coord, { number[][] } our visionMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function availableLoc(selfX, selfY, visionMap) {
  let avail = [];
  for (avail of adjChoices) {
    const xCoord = avail[0] + selfX;
    const yCoord = avail[1] + selfY;
    if (visionMap[yCoord][xCoord] === 0) {
      return avail;
    }
  }
  // No available adjacent location
  return [-2, -2];
}
/**
 * Finds closest mining location for the given map
 * @param { number [] } myLocation, { boolean [][] } resourceMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function closestMiningLocation(loc, map) {
  let closestDist = Infinity;
  let closestLoc;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map.length; x++) {
      if (map[y][x] && manhatDist([x, y], loc) < closestDist) {
        closestDist = manhatDist([x, y], loc);
        closestLoc = [x, y];
      }
    }
  }
  return closestLoc;
}
/**
 * Finds manhattan distance between two locations
 * @param { number [] } locationA, { number [] } locationB
 * @returns { number } Manhattan distance between A and B
 */
function manhatDist(a, b) {
  // Manhattan distance on a square grid.
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}
/**
 * Finds closest coordinates in an array of locations to a starting point
 * @param { number [] } start, { number [][] } locations
 * @returns { number [][]} coordinates of closest location
 */
function closestCoords(start, coords) {
  const distances = [];
  for (const coord of coords) {
    distances.push({
      distance: manhatDist(start, coord),
      coord,
    });
  }
  let min = distances[0];
  for (const dist of distances) {
    if (dist.distance < min.distance) {
      min = dist;
    }
  }
  return min.coord;
}
function fillArray(max, el) {
  const temp = new Array(max);
  const result = new Array(max);
  for (let i = 0; i < max; ++i) {
    temp[i] = el;
  }
  for (let i = 0; i < max; ++i) {
    result[i] = temp.slice(0);
  }
  return result;
}
function simplePathFinder(map, start, dest) {
  // Simple BFS pathfinder
  // Really bad.
  const visited = fillArray(map[0].length, false);
  // const gScore: number[][] = fillArray(map[0].length, Infinity);
  // const fScore: number[][] = fillArray(map[0].length, Infinity);
  const parentCoord = fillArray(map[0].length, []);
  const moveQueue = [];
  const queue = new PriorityQueue();
  const directions = adjChoices;
  let pathEnd;
  queue.insert({
    coord: start,
    priority: manhatDist(start, dest),
  });
  // gScore[start[1]][start[0]] = 0;
  // fScore[start[1]][start[0]] = manhatDist(start, dest);
  parentCoord[start[1]][start[0]] = start;
  while (queue.size() !== 0) {
    const nextHeapitem = queue.pop();
    const loc = nextHeapitem.coord;
    visited[loc[1]][loc[0]] = true;
    if (loc[0] === dest[0] && loc[1] === dest[1]) {
      pathEnd = loc;
      break;
    }
    // Add to queue only if not visited already and closest.
    const candidates = directions.map(val => {
      return [val[0] + loc[0], val[1] + loc[1]];
    });
    for (const candidate of candidates) {
      // Check bounds
      if (
        candidate[1] >= 0 &&
        candidate[1] < map[0].length &&
        (candidate[0] >= 0 && candidate[0] < map[0].length)
      ) {
        // Check visit and passable
        if (
          visited[candidate[1]][candidate[0]] !== true &&
          map[candidate[1]][candidate[0]] === true
        ) {
          // If not visited and is passable, push to queue.
          parentCoord[candidate[1]][candidate[0]] = loc;
          const test = manhatDist(candidate, dest);
          queue.insert({
            coord: candidate,
            priority: manhatDist(candidate, dest),
          });
        }
      }
    }
  }
  while (pathEnd !== undefined) {
    moveQueue.push(pathEnd);
    pathEnd = parentCoord[pathEnd[1]][pathEnd[0]];
    if (pathEnd[0] === start[0] && pathEnd[1] === start[1]) {
      pathEnd = undefined;
      moveQueue.push(start);
    }
  }
  // moveQueue.reverse();
  return moveQueue;
}
/**
 * Finds the closest team castle
 * @param { BCAbstractRobot } self
 * @returns { number [][]} coordinates of closest castle
 */
function findClosestFriendlyCastles(self) {
  const storageLocs = [];
  const visibleRobots = self.getVisibleRobots();
  const castles = visibleRobots.filter(robot => {
    if (robot.team === self.me.team && robot.unit === SPECS.CASTLE) {
      return robot;
    }
  });
  for (const loc of castles) {
    storageLocs.push([loc.x, loc.y]);
  }
  return closestCoords([self.me.x, self.me.y], storageLocs);
}
/**
 * Finds the number of visible pilgrims
 * @param { BCAbstractRobot } self
 * @returns { number } number of pilgrims in vision radius, -1 if none
 */
function visiblePilgrims(self) {
  const visibleRobots = self.getVisibleRobots();
  function isPilgrim(robot) {
    return robot.team === self.me.team && robot.unit === SPECS.PILGRIM;
  }
  return visibleRobots.filter(isPilgrim).length;
}
// Function will take in one of our castles and reflect its position to obtain
// the location of an enemy castle
function enemyCastle(xcor, ycor, mapLength, self, horizontal) {
  // vertical reflection on the castle
  const coordinateVertical = [mapLength - xcor - 1, ycor];
  const coordinateHorizontal = [xcor, mapLength - ycor - 1];
  if (!horizontal) {
    return coordinateVertical;
  } else {
    return coordinateHorizontal;
  }
}
function horizontalFlip(self) {
  const length = self.map.length;
  let x;
  let y;
  for (x = 0; x < length; ++x) {
    for (y = 0; y < length; ++y) {
      if (!(self.map[x][y] === self.map[length - x - 1][y])) {
        return false;
      }
    }
  }
  return true;
}

function castleBuild(self) {
  const visionMap = self.getVisibleRobotMap();
  const buildLoc = availableLoc(self.me.x, self.me.y, visionMap);
  self.log(`Castle health: ${self.me.health}`);
  // Pilgrims have been killed off, build new ones
  if (visiblePilgrims(self) < 2) {
    self.log(
      `Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
        self.me.turn
      })`,
    );
    return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
  }
  // Repeat while castle has enough karbonite for at least one pilgrim
  if (self.karbonite >= 25) {
    self.log(
      `Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
        self.me.turn
      })`,
    );
    return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
  }
}

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.resourceLocation = undefined;
    this.goMining = false;
    this.destinationQueue = [];
    this.destination = undefined;
    this.nextMove = undefined;
    this.enemyCastleLoc = [];
    this.enemyCastleNum = 0;
    this.runPathAgain = 0;
  }
  turn() {
    const choice = availableLoc(
      this.me.x,
      this.me.y,
      this.getVisibleRobotMap(),
    );
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
              this.enemyCastleLoc.push(
                enemyCastle(rob.x, rob.y, this.map.length, this, horizontal),
              );
              this.destination = this.enemyCastleLoc[this.enemyCastleNum];
              this.destinationQueue = simplePathFinder(
                this.map,
                [this.me.x, this.me.y],
                this.destination,
              );
              this.log(
                'CASTLE LOCATION - PROPHET' +
                  this.enemyCastleLoc[this.enemyCastleNum][0] +
                  ', ' +
                  this.enemyCastleLoc[this.enemyCastleNum][1],
              );
            }
          }
        }
        if (this.runPathAgain > 0) {
          this.destinationQueue = simplePathFinder(
            this.map,
            [this.me.x, this.me.y],
            this.destination,
          );
          this.runPathAgain--;
          return this.move(choice[0], choice[1]);
        }
        // this.log(`Prophet health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        if (
          this.enemyCastleLoc !== null &&
          (this.destinationQueue !== undefined &&
            this.destinationQueue.length !== 0)
        ) {
          const toMove = rushCastle(
            this,
            this.destination,
            this.destinationQueue,
          );
          if (toMove === null) {
            this.runPathAgain = 1;
          } else {
            return this.move(toMove[0], toMove[1]);
          }
        }
        if (this.destinationQueue.length === 0) {
          this.destinationQueue = simplePathFinder(
            this.map,
            [this.me.x, this.me.y],
            this.destination,
          );
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
          this.enemyCastleLoc.push(
            enemyCastle(
              this.me.x,
              this.me.y,
              this.map.length,
              this,
              horizontal,
            ),
          );
          this.log(
            'CASTLE LOCATION' +
              this.enemyCastleLoc[this.enemyCastleNum][0] +
              ', ' +
              this.enemyCastleLoc[this.enemyCastleNum][1],
          );
        }
        return this.handleCastle();
      }
    }
  }
  handleCastle() {
    // Castle build pilgrims at first 2 turns
    if (this.me.turn < 3) {
      const buildLoc = availableLoc(
        this.me.x,
        this.me.y,
        this.getVisibleRobotMap(),
      );
      // Have each castle build pilgrims in first 2 turns
      this.log(
        `Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
          this.me.turn
        })`,
      );
      return this.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
    // If castle can't build, it tries to attack
    if (this.karbonite >= 10) {
      return castleBuild(this);
    }
    const attackingCoordinates = attackFirst(this);
    if (attackingCoordinates) {
      return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
    }
  }
  handlePilgrim() {
    this.log(' > > > PILGRIM TIME > > >');
    // let action: Action | Falsy = undefined;
    if (this.me.turn === 1) {
      this.initializePilgrim();
    }
    if (this.destination === undefined) {
      // Calculate closest karbonite/fuel location.
      this.log(`MY DEST IS ${this.resourceLocation}`);
      this.destination = this.resourceLocation;
      this.destinationQueue = simplePathFinder(
        this.map,
        [this.me.x, this.me.y],
        this.destination,
      );
      this.nextMove = this.destinationQueue.pop();
      this.goMining = true;
      this.log(` > > > CLOSEST MINING SPOT AT ${this.destination}> > >`);
      this.log(` > > > NEXT MOVE ${this.nextMove}> > >`);
    }
    if (this.me.karbonite === 20 || this.me.fuel === 100) {
      // TODO: Make pilgrim walk back to castle if inventory is full.
      this.log('---FULL INVENTORY, RETURNING TO BASE---');
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
      const validLoc = availableLoc(
        this.me.x,
        this.me.y,
        this.getVisibleRobotMap(),
      );
      this.destination = [
        closestCastle[0] + validLoc[0],
        closestCastle[1] + validLoc[1],
      ];
    }
    if (
      this.me.x === this.destination[0] &&
      this.me.y === this.destination[1]
    ) {
      // If on destination and is going mining, mine.
      if (this.goMining === true) {
        this.log('CURRENTLY MINING');
        return this.mine();
      }
      this.destination = undefined;
    }
    if (this.me.turn % 2 === 0);
    if (this.me.x !== this.nextMove[0] && this.me.y !== this.nextMove[1]) {
      // TODO: Possibly move this into a separate function?
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > ME ${this.me.x}, ${this.me.y} > > >`);
      this.log(`> > > nextMove ${this.nextMove} > > >`);
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`);
      this.log(`> > > DEST ${this.destination} > > >`);
      return this.move(moveX, moveY);
    }
    if (
      this.destinationQueue.length !== 0 &&
      (this.me.x === this.nextMove[0] && this.me.y === this.nextMove[1])
    ) {
      // If the destination queue has coordinates and my current location is the
      // same as my next move's location, then pop next destination and set nextMove to it.
      this.nextMove = this.destinationQueue.pop();
      const moveX = this.nextMove[0] - this.me.x;
      const moveY = this.nextMove[1] - this.me.y;
      this.log(`> > > MOVING ${moveX}, ${moveY} > > >`);
      return this.move(moveX, moveY);
    }
  }
  // Sets pilgrims' initial mining job
  initializePilgrim() {
    this.log('> > > FINDING THINGS > > >');
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    this.resourceLocation =
      visiblePilgrims(this) <= 1
        ? closestMiningLocation([this.me.x, this.me.y], this.karbonite_map)
        : closestMiningLocation([this.me.x, this.me.y], this.fuel_map);
    this.log(
      `VISPILGS < 1: ${visiblePilgrims(this) < 1} RESRC LOC: ${
        this.resourceLocation
      }, pilnum${visiblePilgrims(this)}`,
    );
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
