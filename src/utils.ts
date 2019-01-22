export function miningLocations(map: boolean[][]) {
  const locations = [];
  let i = 0;
  let j = 0;
  while(i < map.length) {
    // i is the x coord, j is the y coord.
    // FIXME: this is wrong.
    const resourceLoc: number = map[i].indexOf(true, j);
    locations.push([i, resourceLoc]);
    j = resourceLoc;
    i++;
  }
  return locations;
}