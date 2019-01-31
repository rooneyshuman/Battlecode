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
  // FIXME: Not working for some reason.
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