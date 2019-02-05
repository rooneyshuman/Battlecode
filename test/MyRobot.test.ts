import { closestCoords, closestMiningLocation, fillArray, simplePathFinder } from "../src/utils";
import { PriorityQueue } from "../src/PriorityQueue";
// let robot = new MyRobot();

test("Closest Mining Location", () => {
    const testMap = [[true, true, false], [false, false, false], [false, false, true]]
    const location = closestMiningLocation([2,1], testMap)
    expect(location).toEqual([2, 2]);
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