import { constructCoordMessage, parseMessage,  } from "../src/Communication";

test("Parse Message", () => {
    const message = 1000001;
    const parsedLoc = parseMessage(message);
    expect(parsedLoc).toEqual([1, 1]);
});

test("Construct Message", () => {
    const coords = [2, 2];
    const expectedMessage = 130;
    const testMessage = constructCoordMessage(coords);
    expect(testMessage).toEqual(expectedMessage);
});