import { BCAbstractRobot, SPECS } from 'battlecode';

export function constructCoordMessage(pt: number[]) {
    // Fuel cost: Math.ceil(Math.sqrt(r))
    // pt = [x, y]
    // ex: [1, 1] = 000001000001 = 65
    // ex: [2, 2] = 000010000010 = 130
    const xCoord = pt[0] << 6;
    const yCoord = pt[1];

    return xCoord + yCoord;
}

export function parseMessage(message: number) {
    // 6 bits X coords, 6 bits Y coords.
    // Get x coords.
    // ex: [1, 1] = 000001000001 
    if (message === -1) {
        return [0, 0];
    }
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