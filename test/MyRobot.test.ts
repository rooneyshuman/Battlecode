import { PriorityQueue } from "../src/PriorityQueue";
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
    const testMap = fillArray(50, true); 
    const start = [0, 0];
    const end = [49, 49];
    const path = simplePathFinder(testMap, start, end);
    // console.log(testMap);
    // console.log(path);
})

test.skip("Priority Queue", () => {
    const queue = new PriorityQueue();
    const testItems = [
    {
        coord: [5, 5],
        priority: 5
    }, 
    {
        coord: [2, 2],
        priority: 2
    },
    {
        coord: [6, 6],
        priority: 6
    },
    {
        coord: [1, 1],
        priority: 1
    },
    {
        coord: [0, 0],
        priority: 0
    },
    {
        coord: [3, 3],
        priority: 3
    }];
    for(const el of testItems) {
        queue.insert(el);
    }
    queue.pop();
    queue.insert(testItems[4]);
});