import { constructCoordMessage, parseMessage, constructCastleTalkMessage, parseCastleTalk,  } from "../src/Communication";

test("Parse Message", () => {
    const coords = [5, 16];
    const message = constructCoordMessage(coords);
    const parsedLoc = parseMessage(message);
    expect(parsedLoc).toEqual(coords);
});

test("Construct Message", () => {
    const coords = [2, 2];
    const expectedMessage = 130;
    const testMessage = constructCoordMessage(coords);
    expect(testMessage).toEqual(expectedMessage);
});

test("CastleTalk", () => {
    const coords = [6, 2];
    const mapSize = 45;
    const message = constructCastleTalkMessage(coords, mapSize);
    const decoded = parseCastleTalk(message, mapSize);
    expect(decoded).toEqual([8,3]);
});

test("CastleTalkMessage", () => {
    const coords = [6,2];
    const mapSize = 45;
    const message = constructCastleTalkMessage(coords, mapSize);
    expect(message).toEqual(8);
})

test("Parse Message Fail", () => {
    const message = -1;
    const parsed = parseMessage(message);
    expect(parsed).toEqual([-1,-1]);
})

