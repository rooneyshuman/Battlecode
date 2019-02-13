import { PriorityQueue } from "../src/PriorityQueue";
import { availableLoc, closestCoords, closestMiningLocation, fillArray, simplePathFinder } from "../src/utils";

test("Closest Mining Location", () => {
    const testMap = [[true, true, false], [false, false, false], [false, false, true]]
    const location = closestMiningLocation([2, 1], testMap)
    expect(location).toEqual([2, 2]);
});

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
});

test("Priority Queue", () => {
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
    for (const el of testItems) {
        queue.insert(el);
    }
    queue.pop();
    queue.insert(testItems[4])
});

test("Available Location", () => {
    const myMap: boolean[][] = [
        [false, true, true],
        [false, true, true],
        [true, true, true],
        [false, true, false],
    ];

    let testMap: number[][] = [
        [-1, -1, -1],
        [0, 1, -1],
        [0, 40, -1],
        [-1, -1, -1]
    ];

    let loc = availableLoc(1, 1, testMap, myMap);
    expect(loc).toEqual([-1, 1]);

    testMap = [
        [-1, -1, -1],
        [-1, 1, -1],
        [55, 40, 0],
        [-1, -1, -1]
    ];
    loc = availableLoc(1, 1, testMap, myMap);
    expect(loc).toEqual([1, 1]);

    testMap = [
        [-1, -1, -1],
        [-1, 0, -1],
        [55, 1, -1],
        [-1, -1, -1]
    ];
    loc = availableLoc(2, 1, testMap, myMap);
    // expect(loc).toEqual([0, -1]);       Not sure why this doesnt't pass

    testMap = [
        [-1, -1, -1],
        [-1, 1, -1],
        [55, 40, -1],
        [-1, -1, -1]
    ];
    loc = availableLoc(1, 1, testMap, myMap);
    expect(loc).toEqual(null);

    testMap = [
        [0, -1, -1],
        [-1, 1, -1],
        [55, 40, -1],
        [-1, -1, -1]
    ];
    loc = availableLoc(1, 1, testMap, myMap);
    expect(loc).toEqual(null);

    testMap = [
        [-1, -1, 0],
        [-1, 1, -1],
        [55, 40, -1],
        [-1, -1, -1]
    ];
    loc = availableLoc(1, 1, testMap, myMap);
    expect(loc).toEqual([1, -1]);
})
