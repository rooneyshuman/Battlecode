import { constructCoordMessage, parseMessage,  } from "../src/Communication";

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