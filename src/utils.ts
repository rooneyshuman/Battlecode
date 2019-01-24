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
    const resourceLoc: number = map[i].indexOf(true, j);
    locations.push([i, resourceLoc]);
    j = resourceLoc;
    i++;
  }
  return locations;
}