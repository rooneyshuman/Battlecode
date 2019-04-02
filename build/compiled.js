'use strict';

var SPECS = {
  COMMUNICATION_BITS: 16,
  CASTLE_TALK_BITS: 8,
  MAX_ROUNDS: 1000,
  TRICKLE_FUEL: 25,
  INITIAL_KARBONITE: 100,
  INITIAL_FUEL: 500,
  MINE_FUEL_COST: 1,
  KARBONITE_YIELD: 2,
  FUEL_YIELD: 10,
  MAX_TRADE: 1024,
  MAX_BOARD_SIZE: 64,
  MAX_ID: 4096,
  CASTLE: 0,
  CHURCH: 1,
  PILGRIM: 2,
  CRUSADER: 3,
  PROPHET: 4,
  PREACHER: 5,
  RED: 0,
  BLUE: 1,
  CHESS_INITIAL: 100,
  CHESS_EXTRA: 20,
  TURN_MAX_TIME: 200,
  MAX_MEMORY: 50000000,
  UNITS: [
    {
      CONSTRUCTION_KARBONITE: null,
      CONSTRUCTION_FUEL: null,
      KARBONITE_CAPACITY: null,
      FUEL_CAPACITY: null,
      SPEED: 0,
      FUEL_PER_MOVE: null,
      STARTING_HP: 200,
      VISION_RADIUS: 100,
      ATTACK_DAMAGE: 10,
      ATTACK_RADIUS: [1, 64],
      ATTACK_FUEL_COST: 10,
      DAMAGE_SPREAD: 0,
    },
    {
      CONSTRUCTION_KARBONITE: 50,
      CONSTRUCTION_FUEL: 200,
      KARBONITE_CAPACITY: null,
      FUEL_CAPACITY: null,
      SPEED: 0,
      FUEL_PER_MOVE: null,
      STARTING_HP: 100,
      VISION_RADIUS: 100,
      ATTACK_DAMAGE: 0,
      ATTACK_RADIUS: 0,
      ATTACK_FUEL_COST: 0,
      DAMAGE_SPREAD: 0,
    },
    {
      CONSTRUCTION_KARBONITE: 10,
      CONSTRUCTION_FUEL: 50,
      KARBONITE_CAPACITY: 20,
      FUEL_CAPACITY: 100,
      SPEED: 4,
      FUEL_PER_MOVE: 1,
      STARTING_HP: 10,
      VISION_RADIUS: 100,
      ATTACK_DAMAGE: null,
      ATTACK_RADIUS: null,
      ATTACK_FUEL_COST: null,
      DAMAGE_SPREAD: null,
    },
    {
      CONSTRUCTION_KARBONITE: 15,
      CONSTRUCTION_FUEL: 50,
      KARBONITE_CAPACITY: 20,
      FUEL_CAPACITY: 100,
      SPEED: 9,
      FUEL_PER_MOVE: 1,
      STARTING_HP: 40,
      VISION_RADIUS: 49,
      ATTACK_DAMAGE: 10,
      ATTACK_RADIUS: [1, 16],
      ATTACK_FUEL_COST: 10,
      DAMAGE_SPREAD: 0,
    },
    {
      CONSTRUCTION_KARBONITE: 25,
      CONSTRUCTION_FUEL: 50,
      KARBONITE_CAPACITY: 20,
      FUEL_CAPACITY: 100,
      SPEED: 4,
      FUEL_PER_MOVE: 2,
      STARTING_HP: 20,
      VISION_RADIUS: 64,
      ATTACK_DAMAGE: 10,
      ATTACK_RADIUS: [16, 64],
      ATTACK_FUEL_COST: 25,
      DAMAGE_SPREAD: 0,
    },
    {
      CONSTRUCTION_KARBONITE: 30,
      CONSTRUCTION_FUEL: 50,
      KARBONITE_CAPACITY: 20,
      FUEL_CAPACITY: 100,
      SPEED: 4,
      FUEL_PER_MOVE: 3,
      STARTING_HP: 60,
      VISION_RADIUS: 16,
      ATTACK_DAMAGE: 20,
      ATTACK_RADIUS: [1, 16],
      ATTACK_FUEL_COST: 15,
      DAMAGE_SPREAD: 3,
    },
  ],
};

function insulate(content) {
  return JSON.parse(JSON.stringify(content));
}

class BCAbstractRobot {
  constructor() {
    this._bc_reset_state();
  }

  // Hook called by runtime, sets state and calls turn.
  _do_turn(game_state) {
    this._bc_game_state = game_state;
    this.id = game_state.id;
    this.karbonite = game_state.karbonite;
    this.fuel = game_state.fuel;
    this.last_offer = game_state.last_offer;

    this.me = this.getRobot(this.id);

    if (this.me.turn === 1) {
      this.map = game_state.map;
      this.karbonite_map = game_state.karbonite_map;
      this.fuel_map = game_state.fuel_map;
    }

    try {
      var t = this.turn();
    } catch (e) {
      t = this._bc_error_action(e);
    }

    if (!t) t = this._bc_null_action();

    t.signal = this._bc_signal;
    t.signal_radius = this._bc_signal_radius;
    t.logs = this._bc_logs;
    t.castle_talk = this._bc_castle_talk;

    this._bc_reset_state();

    return t;
  }

  _bc_reset_state() {
    // Internal robot state representation
    this._bc_logs = [];
    this._bc_signal = 0;
    this._bc_signal_radius = 0;
    this._bc_game_state = null;
    this._bc_castle_talk = 0;
    this.me = null;
    this.id = null;
    this.fuel = null;
    this.karbonite = null;
    this.last_offer = null;
  }

  // Action template
  _bc_null_action() {
    return {
      signal: this._bc_signal,
      signal_radius: this._bc_signal_radius,
      logs: this._bc_logs,
      castle_talk: this._bc_castle_talk,
    };
  }

  _bc_error_action(e) {
    var a = this._bc_null_action();

    if (e.stack) a.error = e.stack;
    else a.error = e.toString();

    return a;
  }

  _bc_action(action, properties) {
    var a = this._bc_null_action();
    if (properties)
      for (var key in properties) {
        a[key] = properties[key];
      }
    a['action'] = action;
    return a;
  }

  _bc_check_on_map(x, y) {
    return (
      x >= 0 &&
      x < this._bc_game_state.shadow[0].length &&
      y >= 0 &&
      y < this._bc_game_state.shadow.length
    );
  }

  log(message) {
    this._bc_logs.push(JSON.stringify(message));
  }

  // Set signal value.
  signal(value, radius) {
    // Check if enough fuel to signal, and that valid value.

    var fuelNeeded = Math.ceil(Math.sqrt(radius));
    if (this.fuel < fuelNeeded) throw 'Not enough fuel to signal given radius.';
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value >= Math.pow(2, SPECS.COMMUNICATION_BITS)
    )
      throw 'Invalid signal, must be int within bit range.';
    if (radius > 2 * Math.pow(SPECS.MAX_BOARD_SIZE - 1, 2))
      throw 'Signal radius is too big.';

    this._bc_signal = value;
    this._bc_signal_radius = radius;

    this.fuel -= fuelNeeded;
  }

  // Set castle talk value.
  castleTalk(value) {
    // Check if enough fuel to signal, and that valid value.

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value >= Math.pow(2, SPECS.CASTLE_TALK_BITS)
    )
      throw 'Invalid castle talk, must be between 0 and 2^8.';

    this._bc_castle_talk = value;
  }

  proposeTrade(karbonite, fuel) {
    if (this.me.unit !== SPECS.CASTLE) throw 'Only castles can trade.';
    if (!Number.isInteger(karbonite) || !Number.isInteger(fuel))
      throw 'Must propose integer valued trade.';
    if (
      Math.abs(karbonite) >= SPECS.MAX_TRADE ||
      Math.abs(fuel) >= SPECS.MAX_TRADE
    )
      throw 'Cannot trade over ' + SPECS.MAX_TRADE + ' in a given turn.';

    return this._bc_action('trade', {
      trade_fuel: fuel,
      trade_karbonite: karbonite,
    });
  }

  buildUnit(unit, dx, dy) {
    if (
      this.me.unit !== SPECS.PILGRIM &&
      this.me.unit !== SPECS.CASTLE &&
      this.me.unit !== SPECS.CHURCH
    )
      throw 'This unit type cannot build.';
    if (this.me.unit === SPECS.PILGRIM && unit !== SPECS.CHURCH)
      throw 'Pilgrims can only build churches.';
    if (this.me.unit !== SPECS.PILGRIM && unit === SPECS.CHURCH)
      throw 'Only pilgrims can build churches.';

    if (
      !Number.isInteger(dx) ||
      !Number.isInteger(dx) ||
      dx < -1 ||
      dy < -1 ||
      dx > 1 ||
      dy > 1
    )
      throw 'Can only build in adjacent squares.';
    if (!this._bc_check_on_map(this.me.x + dx, this.me.y + dy))
      throw "Can't build units off of map.";
    if (this._bc_game_state.shadow[this.me.y + dy][this.me.x + dx] > 0)
      throw 'Cannot build on occupied tile.';
    if (!this.map[this.me.y + dy][this.me.x + dx])
      throw 'Cannot build onto impassable terrain.';
    if (
      this.karbonite < SPECS.UNITS[unit].CONSTRUCTION_KARBONITE ||
      this.fuel < SPECS.UNITS[unit].CONSTRUCTION_FUEL
    )
      throw 'Cannot afford to build specified unit.';

    return this._bc_action('build', {
      dx: dx,
      dy: dy,
      build_unit: unit,
    });
  }

  move(dx, dy) {
    if (this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH)
      throw 'Churches and Castles cannot move.';
    if (!this._bc_check_on_map(this.me.x + dx, this.me.y + dy))
      throw "Can't move off of map.";
    if (this._bc_game_state.shadow[this.me.y + dy][this.me.x + dx] === -1)
      throw 'Cannot move outside of vision range.';
    if (this._bc_game_state.shadow[this.me.y + dy][this.me.x + dx] !== 0)
      throw 'Cannot move onto occupied tile.';
    if (!this.map[this.me.y + dy][this.me.x + dx])
      throw 'Cannot move onto impassable terrain.';

    var r = Math.pow(dx, 2) + Math.pow(dy, 2); // Squared radius
    if (r > SPECS.UNITS[this.me.unit]['SPEED'])
      throw 'Slow down, cowboy.  Tried to move faster than unit can.';
    if (this.fuel < r * SPECS.UNITS[this.me.unit]['FUEL_PER_MOVE'])
      throw 'Not enough fuel to move at given speed.';

    return this._bc_action('move', {
      dx: dx,
      dy: dy,
    });
  }

  mine() {
    if (this.me.unit !== SPECS.PILGRIM) throw 'Only Pilgrims can mine.';
    if (this.fuel < SPECS.MINE_FUEL_COST) throw 'Not enough fuel to mine.';

    if (this.karbonite_map[this.me.y][this.me.x]) {
      if (this.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY)
        throw 'Cannot mine, as at karbonite capacity.';
    } else if (this.fuel_map[this.me.y][this.me.x]) {
      if (this.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY)
        throw 'Cannot mine, as at fuel capacity.';
    } else throw 'Cannot mine square without fuel or karbonite.';

    return this._bc_action('mine');
  }

  give(dx, dy, karbonite, fuel) {
    if (dx > 1 || dx < -1 || dy > 1 || dy < -1 || (dx === 0 && dy === 0))
      throw 'Can only give to adjacent squares.';
    if (!this._bc_check_on_map(this.me.x + dx, this.me.y + dy))
      throw "Can't give off of map.";
    if (this._bc_game_state.shadow[this.me.y + dy][this.me.x + dx] <= 0)
      throw 'Cannot give to empty square.';
    if (
      karbonite < 0 ||
      fuel < 0 ||
      this.me.karbonite < karbonite ||
      this.me.fuel < fuel
    )
      throw 'Do not have specified amount to give.';

    return this._bc_action('give', {
      dx: dx,
      dy: dy,
      give_karbonite: karbonite,
      give_fuel: fuel,
    });
  }

  attack(dx, dy) {
    if (this.me.unit === SPECS.CHURCH) throw 'Churches cannot attack.';
    if (this.fuel < SPECS.UNITS[this.me.unit].ATTACK_FUEL_COST)
      throw 'Not enough fuel to attack.';
    if (!this._bc_check_on_map(this.me.x + dx, this.me.y + dy))
      throw "Can't attack off of map.";
    if (this._bc_game_state.shadow[this.me.y + dy][this.me.x + dx] === -1)
      throw 'Cannot attack outside of vision range.';

    var r = Math.pow(dx, 2) + Math.pow(dy, 2);
    if (
      r > SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][1] ||
      r < SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][0]
    )
      throw 'Cannot attack outside of attack range.';

    return this._bc_action('attack', {
      dx: dx,
      dy: dy,
    });
  }

  // Get robot of a given ID
  getRobot(id) {
    if (id <= 0) return null;
    for (var i = 0; i < this._bc_game_state.visible.length; i++) {
      if (this._bc_game_state.visible[i].id === id) {
        return insulate(this._bc_game_state.visible[i]);
      }
    }
    return null;
  }

  // Check if a given robot is visible.
  isVisible(robot) {
    return 'unit' in robot;
  }

  // Check if a given robot is sending you radio.
  isRadioing(robot) {
    return robot.signal >= 0;
  }

  // Get map of visible robot IDs.
  getVisibleRobotMap() {
    return this._bc_game_state.shadow;
  }

  // Get boolean map of passable terrain.
  getPassableMap() {
    return this.map;
  }

  // Get boolean map of karbonite points.
  getKarboniteMap() {
    return this.karbonite_map;
  }

  // Get boolean map of impassable terrain.
  getFuelMap() {
    return this.fuel_map;
  }

  // Get a list of robots visible to you.
  getVisibleRobots() {
    return this._bc_game_state.visible;
  }

  turn() {
    return null;
  }
}

function attackFirst(self) {
  // Get all visible robots within the robots vision radius
  const visibleRobots = self.getVisibleRobots();
  // Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range
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
        case SPECS.CASTLE: {
          priority = 1;
        }
        case SPECS.CRUSADER: {
          priority = 2;
        }
        case SPECS.PREACHER: {
          priority = 3;
        }
        case SPECS.PROPHET: {
          priority = 4;
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
    destQ.pop();
    destQ.pop();
    nextMove = destQ.pop();
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    /*
        const visibleRobots = self.getVisibleRobots();
        const listLength = visibleRobots.length;
        let i;
        for (i = 0; i < listLength; ++i) {
            const rob = visibleRobots[i];
            if (rob.x === nextMove[0] && rob.y === nextMove[1]) {
                return null;
            }
        }
*/
    self.log(`* * * * * MOVING ${moveX}, ${moveY} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    // return self.move(moveX, moveY);
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
    self.log(`**** ME (${self.me.x}, ${self.me.y}) > > >`);
    self.log(`***** nextMove ${nextMove} > > >`);
    self.log(`*(**** MOVING (${moveX}, ${moveY}) > > >`);
    self.log(`****DEST ${dest} > > >`);
    toMove[0] = moveX;
    toMove[1] = moveY;
    return toMove;
    // return self.move(moveX, moveY);
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
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
];
/**
 * Finds an in-bounds open location adjacent to our robot
 * @param { number } our x-coord, { number } our y-coord, { number[][] } our visionMap, { boolean [][] } this.map
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function availableLoc(selfX, selfY, visionMap, passableMap) {
  // let avail: number[] = [];
  for (const avail of adjChoices) {
    const xCoord = avail[0] + selfX;
    const yCoord = avail[1] + selfY;
    const inBounds = checkBounds([xCoord, yCoord], avail, visionMap[0].length);
    let passable;
    if (inBounds) {
      passable = passableMap[yCoord][xCoord];
    }
    if (visionMap[yCoord][xCoord] === 0 && inBounds && passable) {
      return avail;
    }
  }
  // No available adjacent location
  return null;
}
/**
 * Finds closest mining location for the given map
 * @param { number [] } myLocation, { boolean [][] } resourceMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
function closestMiningLocation(loc, map, visibleRobotMap) {
  let closestDist = Infinity;
  let closestLoc;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map.length; x++) {
      if (map[y][x] === true && visibleRobotMap[y][x] <= 0) {
        if (manhatDist([x, y], loc) < closestDist) {
          closestDist = manhatDist([x, y], loc);
          closestLoc = [x, y];
        }
      }
    }
  }
  return closestLoc;
}
function sortByClosest(selfPt, destPts) {
  return destPts.sort((a, b) => {
    return manhatDist(selfPt, a) - manhatDist(selfPt, b);
  });
}
function findResources(map1, map2) {
  const locations1 = [];
  const locations2 = [];
  for (let y = 0; y < map1.length; y++) {
    for (let x = 0; x < map1.length; x++) {
      if (map1[y][x] === true) {
        locations1.push([x, y]);
      }
    }
  }
  for (let y = 0; y < map2.length; y++) {
    for (let x = 0; x < map2.length; x++) {
      if (map2[y][x] === true) {
        locations2.push([x, y]);
      }
    }
  }
  return [locations1, locations2];
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
 * @returns { boolean[]} true/false if location is/not within bounds
 */
function checkBounds(start, toAdd, mapDim) {
  const xCoord = start[0] + toAdd[0];
  const yCoord = start[1] + toAdd[1];
  // Check for new x-coordinate
  if (xCoord >= mapDim || xCoord < 0) {
    return false;
  }
  // Check for new y-coordinate
  if (yCoord >= mapDim || yCoord < 0) {
    return false;
  }
  return true;
}
function simplePathFinder(passableMap, visionMap, start, dest) {
  // Simple BFS pathfinder
  const visited = fillArray(passableMap[0].length, false);
  const parentCoord = fillArray(passableMap[0].length, []);
  const moveQueue = [];
  const queue = new PriorityQueue();
  const directions = adjChoices;
  let pathEnd;
  queue.insert({
    coord: start,
    priority: manhatDist(start, dest),
  });
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
        candidate[1] < passableMap[0].length &&
        (candidate[0] >= 0 && candidate[0] < passableMap[0].length)
      ) {
        // Check visit and passable
        if (
          visited[candidate[1]][candidate[0]] !== true &&
          passableMap[candidate[1]][candidate[0]] === true &&
          visionMap[candidate[1]][candidate[0]] <= 0
        ) {
          // If not visited, is passable, and has no robots, push to queue.
          parentCoord[candidate[1]][candidate[0]] = loc;
          // const test = manhatDist(candidate, dest);
          queue.insert({
            coord: candidate,
            priority: manhatDist(candidate, dest),
          });
        }
      }
    }
  }
  // Grabs shortest path starting from pathEnd
  while (pathEnd !== undefined) {
    moveQueue.push(pathEnd);
    pathEnd = parentCoord[pathEnd[1]][pathEnd[0]];
    if (pathEnd[0] === start[0] && pathEnd[1] === start[1]) {
      pathEnd = undefined;
      moveQueue.push(start);
    }
  }
  // moveQueue.reverse();
  moveQueue.pop();
  return moveQueue;
}
/**
 * Finds the closest team castle
 * @param { BCAbstractRobot } self
 * @returns { number [][]} coordinates of closest castle
 */
function findClosestFriendlyCastles(self) {
  const visibleRobots = self.getVisibleRobots();
  const castles = visibleRobots.filter(robot => {
    if (robot.team === self.me.team && robot.unit === SPECS.CASTLE) {
      return robot;
    }
  });
  return castles[0];
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
/**
 * Finds the number of visible pilgrims
 * @param { BCAbstractRobot } self
 * @returns { number } number of pilgrims in vision radius, -1 if none
 */
function visibleCrusaders(self) {
  const visibleRobots = self.getVisibleRobots();
  function isCrusader(robot) {
    return robot.team === self.me.team && robot.unit === SPECS.CRUSADER;
  }
  return visibleRobots.filter(isCrusader).length;
}
// Function will take in one of our castles and reflect its position to obtain
// the location of an enemy castle
function enemyCastle(selfLoc, map, horizontal) {
  // vertical reflection on the castle
  const mapLength = map.length;
  const xcor = selfLoc[0];
  const ycor = selfLoc[1];
  const coordinateVertical = [mapLength - xcor - 1, ycor];
  const coordinateHorizontal = [xcor, mapLength - ycor - 1];
  if (!horizontal) {
    return coordinateHorizontal;
  } else {
    return coordinateVertical;
  }
}
function horizontalFlip(map) {
  const length = map.length;
  for (let x = 0; x < length; ++x) {
    for (let y = 0; y < length; ++y) {
      if (!(map[y][x] === map[y][length - x - 1])) {
        return false;
      }
    }
  }
  return true;
}
/**
 * Checks if there are any enemy robots in vision radius
 * @param visibleRobots
 * @param team
 */
function visibleEnemy(visibleRobots, team) {
  for (const bot of visibleRobots) {
    if (bot.team !== team) {
      return true;
    }
  }
  return false;
}

function constructCoordMessage(pt) {
  // Fuel cost: Math.ceil(Math.sqrt(r))
  // pt = [x, y]
  // ex: [1, 1] = 000001000001 = 65
  // ex: [5, 16] = 000101 010000 = 336
  /*
    const xCoord = pt[0] << 6;
    const yCoord = pt[1];
    return xCoord + yCoord;
    */
  return pt[0] * 64 + pt[1];
}
function parseMessage(message) {
  if (message === -1) {
    // TODO: Might want to change to returning an undefined
    return [-1, -1];
  }
  // 6 bits X coords, 6 bits Y coords.
  // Get x coords.
  // ex: [5, 16] = 000101 010000 = 336
  /*
    let xCoord = 0;
    let yCoord = 0;
    for(let i = 0; i < 12; i++) {
        if(i < 6) {
            // Do yCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                yCoord += 1 << i - 1;
            }
        }
        else {
            // Do xCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                xCoord += 1 << i - 7; // Offset is 7 b/c, (i - 1) - 6, 6 is from binary offset of x,y
            }
        }
    }
    return [xCoord, yCoord];
    */
  return [Math.floor(message / 64) % 64, message % 64];
}

function handleCastle(self) {
  if (self.me.turn === 1) {
    const karboniteMap = self.karbonite_map;
    const fuelmap = self.fuel_map;
    const resourceLocations = findResources(karboniteMap, fuelmap);
    const karbLocations = resourceLocations[0];
    const fuelLocations = resourceLocations[1];
    for (let i = 0; i < karbLocations.length; ++i) {
      if (manhatDist([self.me.x, self.me.y], karbLocations[i]) < 4) {
        self.resourceSpots++;
      }
    }
    for (let i = 0; i < fuelLocations.length; ++i) {
      if (manhatDist([self.me.x, self.me.y], fuelLocations[i]) < 4) {
        self.resourceSpots++;
      }
    }
    initializeCastle(self);
  }
  if (self.signalQueue.length > 0) {
    checkSignals(self);
    if (self.signalQueue[0] !== undefined) {
      self.log(
        `Queue Length: ${self.signalQueue.length}, I am broadcasting: ${
          self.signalQueue[0]
        }`,
      );
      self.signal(self.signalQueue[0], 1);
    }
  }
  // Castle build pilgrims at first 2 even turns
  // if (self.me.turn < 6 && self.me.turn % 2 === 0) {
  if (self.me.turn - 1 < self.resourceSpots) {
    self.signalQueue.push(orderPilgrim(self));
    self.log(`SIGNAL: ${self.signalQueue[0]}`);
    self.signal(self.signalQueue[0], 1);
    const buildLoc = availableLoc(
      self.me.x,
      self.me.y,
      self.getVisibleRobotMap(),
      self.map,
    );
    // Have each castle build pilgrims in first 2 turns
    if (buildLoc) {
      self.log(
        `Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
          self.me.turn
        })`,
      );
      return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
  }
  // Check for enemies first
  if (visibleEnemy(self.getVisibleRobots(), self.me.team)) {
    const attackCoords = attackFirst(self);
    if (attackCoords) {
      self.log(
        `Visible enemy robot in attack range at (${attackCoords[0]}, ${
          attackCoords[0]
        })`,
      );
      self.log(`ATTACKING!`);
      return self.attack(attackCoords[0], attackCoords[1]);
    }
    self.log(`Visible enemy robot is out of attack range`);
  }
  // Check if enough karb to build
  if (self.karbonite >= 10 && self.me.turn >= 6) {
    self.log(`Enough karb to build..`);
    return castleBuild(self);
  }
}
function castleBuild(self) {
  const visionMap = self.getVisibleRobotMap();
  const buildLoc = availableLoc(self.me.x, self.me.y, visionMap, self.map);
  self.log(`Castle health: ${self.me.health}`);
  // TODO: Check for confirmation signal from pilgrim, then shift signalQueue.
  // Pilgrims have been killed off, build new ones
  const pilgrimNum = visiblePilgrims(self);
  if (pilgrimNum < 2 && buildLoc) {
    self.signalQueue.push(orderPilgrim(self));
    self.signal(self.signalQueue[0], 1);
    self.log(
      `PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${
        buildLoc[1]
      }), turn (${self.me.turn})`,
    );
    return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
  }
  // Check if open location and if enough karb for prophet
  if (self.karbonite >= 25 && buildLoc && self.me.turn > 500) {
    // Temporarily only build 1 prophet
    self.log(
      `Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
        self.me.turn
      })`,
    );
    return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
  } else if (self.karbonite >= 15 && buildLoc) {
    // Build crusaders
    self.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]}) turn (${
      self.me.turn
    }),
        karb (${self.me.karbonite})`);
    return self.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
  }
  // Check if open location and enough karb for pilgrim
  /*
    else if (self.karbonite >= 10 && buildLoc && (self.me.turn % 1000)){
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
    */
}
function initializeCastle(self) {
  self.log('CaStLe InItIaLiZaTiOn');
  self.log('F I N D I N G - - R E S O U R C E S');
  const resourceLocations = findResources(self.karbonite_map, self.fuel_map);
  const myLoc = [self.me.x, self.me.y];
  self.karboniteLocs = sortByClosest(myLoc, resourceLocations[0]);
  self.fuelLocs = sortByClosest(myLoc, resourceLocations[1]);
  self.log(`CLOSEST: ${self.karboniteLocs[0]}`);
}
function orderPilgrim(self) {
  // Broadcast a resource location to a pilgrim.
  // Pilgrim should only listen to broadcasts once.
  // Only build as many pilgrims as there are resources (or # resources / 2)
  // Compare resource lengths. Use the bigger one. If equal, choose karbonite.
  // TODO: Make sure to replenish mining locations if a pilgrim dies.
  let resourceLoc;
  if (self.assignResCount.fuel === self.assignResCount.karb) {
    resourceLoc = self.karboniteLocs.shift();
    self.assignResCount.karb += 1;
  } else {
    if (self.assignResCount.karb < self.assignResCount.fuel) {
      resourceLoc = self.karboniteLocs.shift();
      self.assignResCount.karb += 1;
    } else {
      resourceLoc = self.fuelLocs.shift();
      self.assignResCount.fuel += 1;
    }
  }
  return constructCoordMessage(resourceLoc);
}
function checkSignals(self) {
  // Checks surrounding robots' signals.
  const visibleRobots = self.getVisibleRobots();
  for (const robot of visibleRobots) {
    if (
      (robot.signal !== undefined || robot.signal >= 0) &&
      robot.signal !== self.id
    ) {
      const index = self.signalQueue.indexOf(robot.signal);
      if (index !== -1) {
        self.log('Removing a message');
        self.signalQueue.splice(index, 1);
      }
    }
  }
}

function checkerBoardMovement(self) {
  const formation = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  if (self.checkerBoardSpot === undefined) {
    self.checkerBoardSpot = firstSpot(self);
  }
  if (self.map[self.destination[1]][self.destination[0]] === false) {
    self.log('DESTINATION IMPASSABLE' + '     ' + self.destination);
    return null;
  }
  const visionMap = self.getVisibleRobotMap();
  self.log('SELF.DESTINATION:::::' + self.destination);
  self.log('visionMap ' + visionMap[self.destination[1]][self.destination[0]]);
  if (self.me.x === self.destination[0] && self.me.y === self.destination[1]) {
    self.log('AT DESTINATION');
    return null;
  } else if (visionMap[self.destination[1]][self.destination[0]] > 0) {
    const firstX = self.destination[0];
    const firstY = self.destination[1];
    self.visitedBots.push(visionMap[firstY][firstX]);
    let i;
    for (i = 0; i < 4; ++i) {
      const newX = firstX + formation[i][0];
      const newY = firstY + formation[i][1];
      // Make sure unit is also not going to a karbonite or fuel tile
      let resourceCheck = true;
      if (
        self.karbonite_map[newY][newX] === true ||
        self.fuel_map[newY][newX] === true
      ) {
        resourceCheck = false;
      }
      // Make sure that it is not too close to the CASTLE
      const dist = manhatDist(self.friendlyCastleLoc[0], [newX, newY]);
      let distCheck = true;
      if (dist < 3) {
        distCheck = false;
      }
      if (newX < 0 || newY < 0) {
        continue;
      }
      if (
        visionMap[newY][newX] === 0 &&
        self.map[newY][newX] === true &&
        resourceCheck === true &&
        distCheck === true
      ) {
        self.log('HELLLLOOOOOO : : : ' + newX + ', ' + newY);
        self.destination[0] = newX;
        self.destination[1] = newY;
        i = 5;
        self.destinationQueue = simplePathFinder(
          self.map,
          self.getVisibleRobotMap(),
          [self.me.x, self.me.y],
          self.destination,
        );
        self.destinationQueue.pop();
      }
      if (i === 3) {
        let x;
        self.log('NO NEW SPACES AVAILABLE CHANGE DESTINATION');
        for (x = 0; x < 4; ++x) {
          const nextpointX = firstX + formation[x][0];
          const nextpointY = firstY + formation[x][1];
          if (
            nextpointX === 0 ||
            nextpointY === 0 ||
            nextpointX === self.map.length - 1 ||
            nextpointY === self.map.length - 1
          ) {
            continue;
          }
          let resourceChecks = true;
          if (
            self.karbonite_map[nextpointY][nextpointX] === true ||
            self.fuel_map[nextpointY][nextpointX] === true
          ) {
            resourceChecks = false;
          }
          // Make sure that it is not too close to the CASTLE
          const disti = manhatDist(self.friendlyCastleLoc[0], [
            nextpointX,
            nextpointY,
          ]);
          let distChecks = true;
          if (disti < 3) {
            distChecks = false;
          }
          if (self.visitedBots.includes(visionMap[nextpointY][nextpointX])) {
            continue;
          }
          if (
            resourceChecks === false ||
            distChecks === false ||
            self.map[nextpointY][nextpointX] === false
          ) {
            continue;
          }
          self.destination[0] = nextpointX;
          self.destination[1] = nextpointY;
          break;
        }
      }
    }
    if (i === 4) {
      return null;
    }
    self.log('NEW DESTIONATION :::::: ' + self.destination);
  }
  return goTo(self);
}
function firstSpot(self) {
  // Move to first initial spot. If it is already occupied check to see if one of the formation
  // spots are available and move there.
  const horizontal = horizontalFlip(self.map);
  let firstSpots;
  const visionMap = self.getVisibleRobotMap();
  const inBounds = false;
  if (!horizontal) {
    if (self.enemyCastleLoc[1] > self.me.y) {
      self.log('*****************X********');
      // firstSpots = [self.me.x, self.me.y - 3];
      firstSpots = [
        self.friendlyCastleLoc[0][0],
        self.friendlyCastleLoc[0][1] - 3,
      ];
      while (!inBounds) {
        let resourceCheck = true;
        if (
          self.karbonite_map[firstSpots[1]][firstSpots[0]] === true ||
          self.fuel_map[firstSpots[1]][firstSpots[0]] === true
        ) {
          resourceCheck = false;
        }
        if (
          self.map[firstSpots[1]][firstSpots[0]] === true &&
          resourceCheck === true
        ) {
          break;
        }
        firstSpots[0] = firstSpots[0] - 1;
      }
    } else {
      // firstSpots = [self.me.x, self.me.y + 3];
      firstSpots = [
        self.friendlyCastleLoc[0][0],
        self.friendlyCastleLoc[0][1] + 3,
      ];
      self.log('*****************1********');
      while (!inBounds) {
        if (
          self.karbonite_map[firstSpots[1]][firstSpots[0]] === true ||
          self.fuel_map[firstSpots[1]][firstSpots[0]] === true
        );
        if (self.map[firstSpots[1]][firstSpots[0]] === true) {
          break;
        }
        firstSpots[0] = firstSpots[0] - 1;
      }
    }
  } else {
    if (self.enemyCastleLoc[0] > self.me.x) {
      // firstSpots = [self.me.x - 3, self.me.y];
      firstSpots = [
        self.friendlyCastleLoc[0][0] - 3,
        self.friendlyCastleLoc[0][1],
      ];
      self.log('*****************2********');
      while (!inBounds) {
        if (
          self.karbonite_map[firstSpots[1]][firstSpots[0]] === true ||
          self.fuel_map[firstSpots[1]][firstSpots[0]] === true
        );
        if (self.map[firstSpots[1]][firstSpots[0]] === true) {
          break;
        }
        firstSpots[1] = firstSpots[1] - 1;
      }
    } else {
      // firstSpots = [self.me.x + 3, self.me.y];
      firstSpots = [
        self.friendlyCastleLoc[0][0] + 3,
        self.friendlyCastleLoc[0][1],
      ];
      self.log('*****************3********');
      while (!inBounds) {
        if (
          self.karbonite_map[firstSpots[1]][firstSpots[0]] === true ||
          self.fuel_map[firstSpots[1]][firstSpots[0]] === true
        );
        if (self.map[firstSpots[1]][firstSpots[0]] === true) {
          break;
        }
        firstSpots[1] = firstSpots[1] - 1;
      }
    }
  }
  self.destination = firstSpots;
  const visibleRobots = self.getVisibleRobots();
  const listLength = visibleRobots.length;
  let i;
  for (i = 0; i < listLength; ++i) {
    const rob = visibleRobots[i];
    if (rob.x === self.destination[0] && rob.y === self.destination[1]) {
      return null;
    }
  }
  self.destinationQueue = simplePathFinder(
    self.map,
    self.getVisibleRobotMap(),
    [self.me.x, self.me.y],
    self.destination,
  );
  self.destinationQueue.pop();
  return firstSpots;
}
function goTo(self) {
  self.log('RUN PATH AGAIN ====' + self.runPathAgain);
  if (self.runPathAgain === 1) {
    if (
      availableLoc(
        self.me.x,
        self.me.y,
        self.getVisibleRobotMap(),
        self.map,
      ) === null
    ) {
      return null;
    }
    self.destinationQueue = simplePathFinder(
      self.map,
      self.getVisibleRobotMap(),
      [self.me.x, self.me.y],
      self.destination,
    );
    self.destinationQueue.pop();
    self.runPathAgain--;
  }
  if (
    availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map) ===
    null
  ) {
    return null;
  }
  if (
    self.enemyCastleLoc !== null &&
    (self.destinationQueue !== undefined && self.destinationQueue.length !== 0)
  ) {
    const toMove = self.destinationQueue.pop();
    self.log('DSADSADSADSADSA    ' + toMove);
    toMove[0] = toMove[0] - self.me.x;
    toMove[1] = toMove[1] - self.me.y;
    self.log('TO MOVE ++++++ :' + toMove);
    self.log('DESTINATION +++++ : ' + self.destination);
    const visibleRobots = self.getVisibleRobots();
    const listLength = visibleRobots.length;
    let i;
    for (i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.x === toMove[0] && rob.y === toMove[1]) {
        self.runPathAgain = 1;
        return null;
      }
    }
    if (toMove === null) {
      self.runPathAgain = 1;
    } else {
      return self.move(toMove[0], toMove[1]);
    }
  }
  if (self.destinationQueue.length === 0) {
    self.destinationQueue = simplePathFinder(
      self.map,
      self.getVisibleRobotMap(),
      [self.me.x, self.me.y],
      self.destination,
    );
  }
  return null;
}

function handleCrusader(self) {
  if (self.me.turn === 1) {
    self.log('> > CRUSADER FIRST TURN > >');
    crusaderInit(self);
  }
  const attackingCoordinates = attackFirst(self);
  if (attackingCoordinates) {
    return self.attack(attackingCoordinates[0], attackingCoordinates[1]);
  }
  // Collect crusaders, have them rush when there are 1
  if (visibleCrusaders(self) >= 3) {
    self.rush = true;
  }
  if (self.rush) {
    return rushCrusader(self);
  } else {
    return checkerBoardMovement(self);
  }
}
function crusaderInit(self) {
  const visibleRobots = self.getVisibleRobots();
  const robotMap = self.getVisibleRobotMap();
  const listLength = visibleRobots.length;
  for (let i = 0; i < listLength; ++i) {
    const rob = visibleRobots[i];
    if (rob.unit === SPECS.CASTLE) {
      const horizontal = horizontalFlip(self.map);
      const enemyCastleLoc = enemyCastle([rob.x, rob.y], self.map, horizontal);
      self.friendlyCastleLoc.push([rob.x, rob.y]);
      self.enemyCastleLoc.push(enemyCastleLoc);
      self.destination = self.enemyCastleLoc[self.enemyCastleNum];
      self.destinationQueue = simplePathFinder(
        self.map,
        robotMap,
        [self.me.x, self.me.y],
        self.destination,
      );
      self.log(
        'CASTLE LOCATION - CRUSADER ' +
          self.enemyCastleLoc[self.enemyCastleNum][0] +
          ', ' +
          self.enemyCastleLoc[self.enemyCastleNum][1],
      );
    }
  }
  self.log('dest: ' + self.destination);
  self.log('destQ.len ' + self.destinationQueue.length);
}
function rushCrusader(self) {
  let toMove;
  self.log(
    '> > !!!!!!CRUSADER RUSHING!!!!! > > from ' + self.me.x + ',' + self.me.y,
  );
  if (self.destination === undefined || self.destinationQueue.length === 0) {
    crusaderInit(self);
  }
  // DestinationQueue is still undefined for some reason, just move anywhere available
  toMove =
    self.destinationQueue.length === 0
      ? availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map)
      : rushCastle(self, self.destination, self.destinationQueue);
  self.log('toMove = ' + toMove);
  if (toMove === null) {
    self.log('NO AVAILABLE MOVES');
    return null;
  }
  return self.move(toMove[0], toMove[1]);
}

const KARBONITE = 1;
const FUEL = 2;
function handlePilgrim(self) {
  self.log(' > > > PILGRIM TIME > > >');
  const visibleRobots = self.getVisibleRobotMap();
  if (self.me.turn === 1) {
    initializePilgrim(self);
  }
  if (self.destination === undefined) {
    if (self.resourceLocation !== undefined) {
      if (self.resourceLocation[0] === -1 && self.resourceLocation[1] === -1) {
        readCastleSignal(self);
      } else {
        findDiffMining(self);
      }
    }
    self.log(`MY DEST IS ${self.resourceLocation}`);
    self.destination = self.resourceLocation;
    const robotMap = self.getVisibleRobotMap();
    self.destinationQueue = simplePathFinder(
      self.map,
      robotMap,
      [self.me.x, self.me.y],
      self.destination,
    );
    self.goMining = true;
    // self.log(` > > > CLOSEST MINING SPOT AT ${self.destination}> > >`);
  }
  let full;
  if (self.me.karbonite === 20 || self.me.fuel === 100) {
    full = true;
    self.log('---FULL INVENTORY, RETURNING TO BASE---');
    self.goMining = false;
    const castleToGo = self.originalCastleLoc;
    /*
        let closestCastle = findClosestFriendlyCastles(self);
        if (closestCastle === undefined) {
          // closestCastle = self.originalCastleLoc;
          self.log("CLOSEST CASTLE ++++++" + self.originalCastleLoc);
          castleToGo = self.originalCastleLoc;
        }
        else{
          castleToGo = [closestCastle.x, closestCastle.y];
        }
        */
    // const dx = closestCastle.x - self.me.x;
    // const dy = closestCastle.y - self.me.y;
    const dx = castleToGo[0] - self.me.x;
    const dy = castleToGo[1] - self.me.y;
    const dist = Math.pow(dx, 2) + Math.pow(dy, 2);
    // If castle is in adjacent square, give resources
    if (dist <= 2) {
      self.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
      self.destination = undefined;
      return self.give(dx, dy, self.me.karbonite, self.me.fuel);
    }
    // Not near castle, set destination queue to nav to base
    const validLoc = availableLoc(
      self.me.x,
      self.me.y,
      visibleRobots,
      self.map,
    );
    // self.destination = [closestCastle.x + validLoc[0], closestCastle.y + validLoc[1]];
    self.destination = [
      castleToGo[0] + validLoc[0],
      castleToGo[1] + validLoc[1],
    ];
    self.log('DESTINATION TO RETURN TO CASTLE:::' + self.destination);
    self.destinationQueue = simplePathFinder(
      self.map,
      visibleRobots,
      [self.me.x, self.me.y],
      self.destination,
    );
    self.log(` > > > MY LOCATION (${self.me.x}, ${self.me.y})> > >`);
    self.log(` > > > CLOSEST CASTLE AT ${self.destination}> > >`);
  }
  // Mine or set mining location to destination if not full and at location
  if (
    self.me.x === self.destination[0] &&
    self.me.y === self.destination[1] &&
    !full
  ) {
    // If on destination and is going mining, mine.
    if (self.goMining === true) {
      self.log('CURRENTLY MINING');
      return self.mine();
    }
    self.destination = undefined;
  }
  if (visibleRobots[self.destination[1]][self.destination[0]] > 0 && !full) {
    self.log('I AM A DUMB ROBOT');
    // findDiffMining(self);
    // TODO: Make path finder faster
    // TODO: Keep track of occupied mining locations.
    // self.destinationQueue = simplePathFinder(self.map, visibleRobots,[self.me.x, self.me.y], self.destination);
  }
  // Move to destination
  if (self.destinationQueue.length !== 0) {
    // If the destination queue has coordinates and my current location is the
    // same as my next move's location, then pop next destination and set nextMove to it.
    if (self.runPathAgain === 1) {
      self.log('DO NOTHING');
      self.runPathAgain = 0;
      self.log('NEXT MOVE =======' + self.nextMove);
    } else {
      self.nextMove = self.destinationQueue.pop();
      self.log('NEXT MOVE =======' + self.nextMove);
    }
    if (visibleRobots[self.nextMove[1]][self.nextMove[0]] > 0) {
      self.log("THERE'S A DUMB ROBOT IN THE WAY");
      self.runPathAgain = 1;
      return null;
      self.destinationQueue = simplePathFinder(
        self.map,
        visibleRobots,
        [self.me.x, self.me.y],
        self.destination,
      );
      self.destinationQueue.pop();
      self.nextMove = self.destinationQueue.pop();
      self.log('ROBOTO IN WAY NEXT MOVE IS NOW::::' + self.nextMove);
      self.log(
        `Destination: ${
          self.destination
        }, QUEUE: ${self.destinationQueue.reverse()}`,
      );
    }
    const moveX = self.nextMove[0] - self.me.x;
    const moveY = self.nextMove[1] - self.me.y;
    self.log(`> > > Next Move: ${self.nextMove} > > >`);
    self.log(`> > > MOVING ${moveX}, ${moveY} > > >`);
    return self.move(moveX, moveY);
  }
}
// Sets pilgrims' initial mining job
function initializePilgrim(self) {
  self.log('> > > FINDING THINGS > > >');
  // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
  // Even pilgrims mine karbonite, odd pilgrims mine fuel.
  // self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`)
  const castle = findClosestFriendlyCastles(self);
  self.originalCastleLoc = [castle.x, castle.y];
  self.resourceLocation = parseMessage(castle.signal);
  // self.resourceLocation = [0, 0];
  self.log(`MESSAGE: ${castle.signal}`);
  self.log('RESOURCE LOCATION:::' + self.resourceLocation);
  if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
    const message = constructCoordMessage(self.resourceLocation);
    self.signal(message, 1);
  }
  // self.log(`VISPILGS < 1: ${visiblePilgrims(self) < 1} RESRC LOC: ${self.resourceLocation}, npmum${visiblePilgrims(self)}`);
}
function readCastleSignal(self) {
  const castle = findClosestFriendlyCastles(self);
  self.resourceLocation = parseMessage(castle.signal);
  if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
    const message = constructCoordMessage(self.resourceLocation);
    self.signal(message, 1);
  }
}
function findDiffMining(self) {
  // It's like initializePilgrim, but the opposite.
  const visibleRobots = self.getVisibleRobotMap();
  // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
  // Even pilgrims mine karbonite, odd pilgrims mine fuel.
  self.resourceToMine = self.resourceToMine === KARBONITE ? FUEL : KARBONITE;
  self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`);
  self.resourceLocation =
    self.resourceToMine === KARBONITE
      ? closestMiningLocation(
          [self.me.x, self.me.y],
          self.karbonite_map,
          visibleRobots,
        )
      : closestMiningLocation(
          [self.me.x, self.me.y],
          self.fuel_map,
          visibleRobots,
        );
}

function handleProphet(self) {
  if (self.me.turn === 1) {
    self.log('> > PROPHET FIRST TURN > >');
    const visibleRobots = self.getVisibleRobots();
    const robotMap = self.getVisibleRobotMap();
    const listLength = visibleRobots.length;
    for (let i = 0; i < listLength; ++i) {
      const rob = visibleRobots[i];
      if (rob.unit === SPECS.CASTLE) {
        const horizontal = horizontalFlip(self.map);
        const enemyCastleLoc = enemyCastle(
          [rob.x, rob.y],
          self.map,
          horizontal,
        );
        self.friendlyCastleLoc.push([rob.x, rob.y]);
        self.enemyCastleLoc.push(enemyCastleLoc);
        self.destination = self.enemyCastleLoc[self.enemyCastleNum];
        self.destinationQueue = simplePathFinder(
          self.map,
          robotMap,
          [self.me.x, self.me.y],
          self.destination,
        );
        self.log(
          'CASTLE LOCATION - PROPHET' +
            self.enemyCastleLoc[self.enemyCastleNum][0] +
            ', ' +
            self.enemyCastleLoc[self.enemyCastleNum][1],
        );
      }
    }
  }
  const attackingCoordinates = attackFirst(self);
  if (attackingCoordinates) {
    return self.attack(attackingCoordinates[0], attackingCoordinates[1]);
  }
  if (self.me.turn % 12 === 0) {
    return rushProphet(self);
  } else {
    return checkerBoardMovement(self);
  }
}
function rushProphet(self) {
  if (self.runPathAgain > 1) {
    const choice = availableLoc(
      self.me.x,
      self.me.y,
      self.getVisibleRobotMap(),
      self.map,
    );
    self.runPathAgain--;
    return self.move(choice[0], choice[1]);
  } else if (self.runPathAgain === 1) {
    self.destinationQueue = simplePathFinder(
      self.map,
      self.getVisibleRobotMap(),
      [self.me.x, self.me.y],
      self.destination,
    );
    self.runPathAgain--;
  }
  if (
    self.enemyCastleLoc !== null &&
    (self.destinationQueue !== undefined && self.destinationQueue.length !== 0)
  ) {
    const toMove = rushCastle(self, self.destination, self.destinationQueue);
    if (toMove === null) {
      self.runPathAgain = 2;
    } else {
      return self.move(toMove[0], toMove[1]);
    }
  }
  if (self.destinationQueue.length === 0) {
    self.destinationQueue = simplePathFinder(
      self.map,
      self.getVisibleRobotMap(),
      [self.me.x, self.me.y],
      self.destination,
    );
  }
  const choicer = availableLoc(
    self.me.x,
    self.me.y,
    self.getVisibleRobotMap(),
    self.map,
  );
  return self.move(choicer[0], choicer[1]);
}

class MyRobot extends BCAbstractRobot {
  constructor() {
    super();
    this.rush = false;
    this.originalCastleLoc = undefined;
    this.resourceToMine = 0;
    this.resourceLocation = undefined;
    this.goMining = false;
    this.signalQueue = [];
    this.crusaderCount = 0;
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
      karb: 0,
    };
    this.resourceSpots = 0;
  }
  turn() {
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        // this.log("Pilgrim");
        return handlePilgrim(this);
      }
      case SPECS.CRUSADER: {
        this.log(' > > CRUSADER > >');
        return handleCrusader(this);
      }
      case SPECS.PROPHET: {
        this.log('> > PROPHET > >');
        return handleProphet(this);
      }
      case SPECS.PREACHER: {
        // this.log(`Preacher health: ${this.me.health}`);
        const choice = availableLoc(
          this.me.x,
          this.me.y,
          this.getVisibleRobotMap(),
          this.map,
        );
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
          this.enemyCastleLoc.push(
            enemyCastle([this.me.x, this.me.y], this.map, horizontal),
          );
          this.log(
            'CASTLE LOCATION' +
              this.enemyCastleLoc[this.enemyCastleNum][0] +
              ', ' +
              this.enemyCastleLoc[this.enemyCastleNum][1],
          );
        }
        return handleCastle(this);
      }
    }
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();

var robot = new MyRobot();
