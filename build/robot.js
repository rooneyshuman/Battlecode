import { SPECS, BCAbstractRobot } from 'battlecode';

// const Attack = {};
// Attack.attackFirst = (self) =>
function attackFirst(self) {
  // Get all visible robots within the robots vision radius
  const visibleRobots = self.getVisibleRobots();
  // Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range\
  const listLength = visibleRobots.length;
  // let x = 0; // keep track of number of robots in attackableRobots array
  let i;
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
      const robotToAttack = new Array(2);
      robotToAttack[0] = rob.x - self.me.x;
      robotToAttack[1] = rob.y - self.me.y;
      return robotToAttack;
    }
    return null;
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
 * Finds an in-bounds location adjacent to our robot
 * @param { BCAbstractRobot } self
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function simpleValidLoc(self) {
  let i = 0;
  let bounds = checkBounds(
    [self.me.x, self.me.y],
    adjChoices[i],
    self.map[0].length,
  );
  while (bounds[0] !== true && bounds[1] !== true && i < adjChoices.length) {
    // While adjChoices[i] is out of bounds, iterate through i.
    i += 1;
    bounds = checkBounds(
      [self.me.x, self.me.y],
      adjChoices[i],
      self.map[0].length,
    );
  }
  if (i > adjChoices.length) {
    return [0, 1];
  }
  return adjChoices[i];
}
/**
 * Finds an in-bounds random location adjacent to our robot
 * @param { BCAbstractRobot } self
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function randomValidLoc(self) {
  // TODO: Possibly check if a unit is in the desired space for movement?
  const mapDim = self.map[0].length;
  let rand = Math.floor(Math.random() * adjChoices.length);
  let loc = adjChoices[rand];
  let counter = 0;
  do {
    if (self.me.y + loc[1] >= mapDim) {
      loc[1] = -1;
    }
    if (self.me.y + loc[1] < 0) {
      loc[1] = 1;
    }
    if (self.me.x + loc[0] >= mapDim) {
      loc[0] = -1;
    }
    if (self.me.x + loc[0] < 0) {
      loc[0] = 1;
    }
    rand = (rand + 1) % adjChoices.length;
    counter++;
  } while (
    !self.map[self.me.y + loc[1]][self.me.x + loc[0]] &&
    counter < adjChoices.length
  );
  if (counter >= adjChoices.length) {
    loc = [0, 1];
  }
  return loc;
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
/**
 * Checks if a location is within map bounds
 * @param { number [] } start, { number [] } [dx, dy], { number } mapDimensions
 * @returns { number [][]} coordinates of closest location
 */
function checkBounds(start, toAdd, mapDim) {
  const result = [true, true];
  if (start[1] + toAdd[1] >= mapDim) {
    result[1] = false;
  }
  if (start[1] + toAdd[1] < 0) {
    result[1] = false;
  }
  if (start[0] + toAdd[0] >= mapDim) {
    result[0] = true;
  }
  if (start[0] + toAdd[0] < 0) {
    result[0] = true;
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

function castleBuild(self) {
  const units = [1, 2, 3, 4];
  const buildLoc = randomValidLoc(self);
  self.log(`Castle health: ${self.me.health}`);
  // Repeat while castle has enough karbonite for at least one pilgrim
  while (self.karbonite >= 10) {
    const unitToBuild = units[Math.floor(Math.random() * units.length)];
    switch (unitToBuild) {
      case 1: {
        if (self.karbonite >= 10) {
          self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
        }
      }
      case 2: {
        if (self.karbonite >= 20) {
          self.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
        }
      }
      case 3: {
        if (self.karbonite >= 25) {
          self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
        }
      }
      case 4: {
        if (self.karbonite >= 30) {
          self.log(`Building a preacher at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PREACHER, buildLoc[0], buildLoc[1]);
        }
      }
    }
  }
}

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.adjChoices = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
    this.storageLoc = [];
    this.karboniteLocation = undefined;
    this.fuelLocation = undefined;
    this.goMining = false;
    this.destinationQueue = [];
    this.destination = undefined;
    this.nextMove = undefined;
  }
  turn() {
    const choice = randomValidLoc(this);
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
  handleCastle() {
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
      this.log(' > > > FINDING CLOSEST MINING SPOT > > >');
      this.destination = this.karboniteLocation;
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
      const validLoc = simpleValidLoc(this);
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
  initializePilgrim() {
    this.log('> > > FINDING THINGS > > >');
    this.karboniteLocation = closestMiningLocation(
      [this.me.x, this.me.y],
      this.karbonite_map,
    );
    this.fuelLocation = closestMiningLocation(
      [this.me.x, this.me.y],
      this.fuel_map,
    );
    this.log(`KARB LOC: ${this.karboniteLocation}`);
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
