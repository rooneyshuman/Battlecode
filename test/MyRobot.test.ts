import { miningLocations } from "../src/MyRobot";

// let robot = new MyRobot();

test("Mining Locations", () => {
    const testMap = [[true, false, false], [false, true, false], [false, false, true]]
    expect(miningLocations(testMap)).toHaveLength(3);
})