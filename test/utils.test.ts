import { calcDegDirection, randomValidLoc, fillArray, manhatDist, simplePathFinder, simpleValidLoc, availableLoc, closestMiningLocation, sortByClosest, findResources, closestCoords, horizontalFlip, enemyCastle, checkBounds } from "../src/utils";

test("Simple Valid Location", () => {
    const meX = 1;
    const meY = 2;
    const map: boolean[][] = [
        [false, true, true],
        [false, true, true],
        [true, true, true],
        [false, true, false],
    ]
    const choice = simpleValidLoc(meX, meY, map);
    expect(choice).toEqual([1,-1]);
})

test("Random Valid Location", () => {
    const meX = 1;
    const meY = 2;
    const map: boolean[][] = [
        [false, false, false],
        [false, false, true],
        [false, false, false],
        [false, false, false],
    ]
    const choice = randomValidLoc(meX, meY, map);
    expect(choice).toEqual([0,1]);
})

test("Available Location", () => {
    const meX = 1;
    const meY = 2;
    const passableMap: boolean[][] = [
        [false, true, true],
        [false, true, true],
        [true, true, true],
        [false, true, false],
    ]
    const visionMap = [
        [-1, 0, -1],
        [-1, 0, -1],
        [55, 1, -1],
        [-1, 0, -1]
    ];
    const choice = availableLoc(meX, meY, visionMap, passableMap);
    expect(choice).toEqual([0,-1]);
})

test("Closest Mining Location", () => {
    const me = [1,2];
    const map: boolean[][] = [
        [false, true, true],
        [false, true, true],
        [true, true, true],
        [false, true, false],
    ]
    const visibleBotMap = [
        [-1, 0, -1],
        [-1, 0, -1],
        [55, 1, -1],
        [-1, 0, -1]
    ];
    const choice = closestMiningLocation(me, map, visibleBotMap);
    expect(choice).toEqual([1,1]);
})

test("Manhattan Distance", () => {
    const locationA = [0,1];
    const locationB = [3,2];
    const dist = manhatDist(locationA, locationB);
    expect(dist).toEqual(4);
})

test("sortByClosest", () => {
    const me = [0,1];
    const destPts = [
        [-1, 0],
        [1, 0]
    ]; 
    const sorted = sortByClosest(me, destPts);
    expect(sorted).toEqual([[-1,0],[1,0]]);
})

test("Find Resources", () => {
    const map1: boolean[][] = [
        [false, false, true],
        [true, false, false],
        [false, false, true],
    ]
    const map2: boolean[][] = [
        [false, true, false],
        [true, false, false],
        [false, false, true],
    ]
    const res = findResources(map1, map2);
    expect(res).toEqual([[[2,0],[0,1],[2,2]], [[1,0],[0,1],[2,2]]]);
})

test("Calculate Degree Direction", () => {
    let degree = calcDegDirection([2,1],[3,1]);
    expect(degree).toEqual(0);

    degree = calcDegDirection([2,1],[3,2]);
    expect(degree).toEqual(45);

    degree = calcDegDirection([2,1],[2,0]);
    expect(degree).toEqual(-90);

    degree = calcDegDirection([2,1],[2,2]);
    expect(degree).toEqual(90);

    degree = calcDegDirection([2,1],[1,2]);
    expect(degree).toEqual(-45);

    degree = calcDegDirection([2,1],[3,0]);
    expect(degree).toEqual(-45);

    degree = calcDegDirection([2,1],[1,0]);
    expect(degree).toEqual(45);
})

test("Closest Coords", () => {
    const start = [0,1];
    const coords = [
        [2,3],
        [5,7],
        [10,11],
    ]
    const closest = closestCoords(start, coords);
    expect(closest).toEqual([2,3]);
})

test("Horizontal Flip", () => {
    const map1 = [
        [true, false, false],
        [false, false, false],
        [true, false, false]
    ]
    const horiz1 = horizontalFlip(map1);
    const map2 = [
        [true, false, true],
        [false, false, false],
        [true, false, true]
    ]
    const horiz2 = horizontalFlip(map2);
    expect(horiz1).toEqual(false);
    expect(horiz2).toEqual(true);
})

test("Enemy Castle", () => {
    const self = [0,1];
    const map = [
        [true, false, false],
        [false, false, false],
        [true, false, false]
    ];
    const horiz = false;
    const enemy = enemyCastle(self, map, horiz);
    expect(enemy).toEqual([0,1]);
})

test("Check Bounds", () => {
    const self = [0,1];
    const toAdd = [1,1];
    const mapDim = 5;
    const bounds = checkBounds(self, toAdd, mapDim);
    expect(bounds).toEqual(true);
})

test("Simple Path Finder", () => {
    const passable = [
        [true, false, false],
        [false, true, false],
        [true, false, true]
    ]; 

    const vision = [
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 0],
    ]; 

    const start = [0,0];
    const dest = [2,2];
    const path = simplePathFinder(passable, vision, start, dest);
    expect(path).toEqual([[2,2], [1,1]]);
})
