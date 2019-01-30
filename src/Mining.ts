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