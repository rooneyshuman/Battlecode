import { calcDegDirection, fillArray, manhatDist, simplePathFinder } from "../src/utils";

test("Manhattan Distance", () => {
    const locationA = [0,1];
    const locationB = [3,2];
    const dist = manhatDist(locationA, locationB);
    expect(dist).toEqual(4);
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
