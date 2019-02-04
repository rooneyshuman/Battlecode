import { closestCoords, fillArray, miningLocations,  simplePathFinder } from "../src/utils";

// let robot = new MyRobot();

test("Mining Locations", () => {
    const testMap = [[true, true, false], [false, true, false], [false, false, true]]
    const locations = miningLocations(testMap)
    expect(locations).toHaveLength(4);
    expect(locations[0]).toEqual([0, 0]);
    expect(locations[1]).toEqual([1, 0]);
    expect(locations[2]).toEqual([1, 1]);
    expect(locations[3]).toEqual([2, 2]);
})

test("Closest Coords", () => {
    const start = [0, 0];
    const coords = [[2, 5], [3, 3], [1, 1]];
    const closest = closestCoords(start, coords);
    expect(closest).toEqual([1, 1]);
});

test("Pathfinding", () => {
    const testMap = fillArray(3, true);
    const start = [0, 0];
    const end = [2, 2];
    const path = simplePathFinder(testMap, start, end);
    // console.log(path);
})