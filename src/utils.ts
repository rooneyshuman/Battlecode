import { BCAbstractRobot, SPECS } from 'battlecode';

const adjChoices: number[][] = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
];

const north: number[][] = [
  [-1, 1],
  [0, 1],
  [1, 1]
];

const east: number[][] = [
  [1, 1],
  [1, 0],
  [1, -1]
]

const south: number[][] = north.map((el) => ([el[0] * -1, el[1] * -1]));
const west: number[][] = east.map((el) => ([el[0] * -1, el[1] * -1]));

export function simpleValidLoc(self: BCAbstractRobot): number[] {
    let i = 0;
    while (!self.map[self.me.y + adjChoices[i][1]][self.me.x + adjChoices[i][0]] && i < adjChoices.length) {
      // Makes sure the terrain is passable.
      // self.map is indexed as [y][x]
      i++;
    }
    return adjChoices[i];
}

export function randomValidLoc(self: BCAbstractRobot): number[] {
    // TODO: Possibly check if a unit is in the desired space for movement?
    const mapDim = self.map[0].length
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
    } while (!self.map[self.me.y + loc[1]][self.me.x + loc[0]] && counter < adjChoices.length);
    if (counter >= adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }

/**
 * Finds locations for the given map
 * @param { boolean [][] } map
 * @returns { boolean [][] } Array containing elements that consist of [x , y]
 */
export function miningLocations(map: boolean[][]): number[][] {
  const locations = [];
  let i = 0;
  let j = 0;
  while(i < map.length) {
    // i is the x coord, j is the y coord.
    while(j !== -1 && j < map.length) {
      const resourceLoc: number = map[i].indexOf(true, j);
      if(resourceLoc === -1) {
        j = -1;
      }
      else {
        locations.push([resourceLoc, i]);
        j = resourceLoc + 1;
      }
    }
    j = 0;
    i++;
  }
  return locations;
}

/**
 * Uses A* algorithm to find the shortest path between start and end
 * Credit: Amit Patel, reblobgames, A* algorithm
 * A* is like Djikstra's 
 */
export function pathFinder(map: boolean[][], start: number[], end: number[]) {
  // TODO: Figure out a comparison function for the priority queue
  return 0
}

function heuristic(a: number[], b: number[]) {
  // Manhattan distance on a square grid.
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export interface MapItemInterface {
  x: number,
  y: number,
  passable: boolean,
  visited: boolean
  parent: MapItemInterface,
}

export function buildExtraInfoMap(map: boolean[][]): MapItemInterface[][] {
  const result = [];
  for(let y = 0; y < map.length; ++y) {
    const row = [];
    for(let x = 0; x < map.length; ++x) {
      row.push({
        x,
        y,
        passable: map[y][x],
        visited: false,
        parent: undefined,
      });
    }
    result.push(row);
  }
  return result;
}

export function simplePathFinder(map: boolean[][], start: number[], dest: number[]): number[][] {
  // Simple BFS pathfinder
  // Does not find shortest diagonal path.
  // TODO: Make visiting and parent coord array
  const visited: boolean[][] = fillArray(map[0].length, false);
  const parentCoord: number[][][] = fillArray(map[0].length, []);
  const moveQueue: number[][] = [];
  const queue: number[][] = [];
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let pathEnd;

  queue.push(start);
  parentCoord[start[1]][start[0]] = start;

  while(queue.length !== 0) {
    const loc = queue.shift();
    visited[loc[1]][loc[0]] = true;

    if(loc[0] === dest[0] && loc[1] === dest[1]) {
      pathEnd = loc;
      break;
    }

    // Add to queue only if not visited already.
    for(let i = 0; i < 4; ++i) {
      // Add adjacent tiles
      const newY = loc[1] + directions[i][1];
      const newX = loc[0] + directions[i][0];
      // Edge checking
      if((newY >= 0 && newY < map[0].length) && (newX >= 0 && newX < map[0].length)) {
        const newLoc = [newX, newY];
        if(visited[newY][newX] !== true && map[newY][newX] === true) {
          // If not visited and is passable, push to queue.
          parentCoord[newLoc[1]][newLoc[0]] = loc;
          queue.push(newLoc);
        }
      }
    }
  }
  while(pathEnd !== undefined) {
    moveQueue.push(pathEnd);
    pathEnd = parentCoord[pathEnd[1]][pathEnd[0]];

    if (pathEnd[0] === start[0] && pathEnd[1] === start[1]) {
      pathEnd = undefined;
      moveQueue.push(start);
    }
  }
  moveQueue.reverse();
  return moveQueue;
}

function calcDirection(p1: number[], p2: number[]): number {
  const angleRad = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]));
  return ((angleRad * 180) / Math.PI);
}

export function fillArray(max: number, el: any) {
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