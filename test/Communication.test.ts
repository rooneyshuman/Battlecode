import { constructCoordMessage, parseMessage, constructCastleTalkMessage, parseCastleTalk,  } from "../src/Communication";

test("Parse Message", () => {
    const coords = [5, 16];
    const message = constructCoordMessage(coords);
    const parsedLoc = parseMessage(message);
    expect(parsedLoc).toEqual(coords);
});

test.skip("Construct Message", () => {
    const coords = [2, 2];
    const expectedMessage = 130;
    const testMessage = constructCoordMessage(coords);
    expect(testMessage).toEqual(expectedMessage);
});

test.skip("CastleTalk", () => {
    const coords = [6, 2];
    const mapSize = 45;
    const message = constructCastleTalkMessage(coords, mapSize);
    const decoded = parseCastleTalk(message, mapSize);
    expect(decoded).toEqual(coords);
});