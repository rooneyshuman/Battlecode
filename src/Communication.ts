import { BCAbstractRobot, SPECS } from 'battlecode';

export function constructCoordMessage(pt: number[]) {
    // Fuel cost: Math.ceil(Math.sqrt(r))
    // pt = [x, y]
    // ex: [1, 1] = 000001000001 
    const message: string[] = [];
    for(let i = 0; i < 12; ++i) {
        if(i < 6 && (pt[1] & 1 << i)) {
            // Y coords
            if(pt[1] & 1 << i) {
                message.push("1");
            }
            else {
                message.push("0");
            }
        }
        else {
            // X Coords
            const offset = i - 6;
            if(pt[0] & 1 << offset) {
                message.push("1");
            }
            else {
                message.push("0");
            }
        }
    }
    // LOL so janky, but it works, so whatever.
    return Number(message.reverse().join(''));
}

export function parseMessage(message: number) {
    // 6 bits X coords, 6 bits Y coords.
    // Get x coords.
    // ex: [1, 1] = 000001000001 
    let xCoord = 0;
    let yCoord = 0;
    for(let i = 0; i < 12; i++) {
        if(i < 6) {
            // Do yCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                yCoord += 1 << i - 1;
            }
        }
        else {
            const offset = i - 6;
            // Do xCoord
            // Bitwise black magic
            if (message & (1 << offset - 1)) {
                xCoord += 1 << offset - 1;
            }
        }
    }
    return [xCoord, yCoord];
}