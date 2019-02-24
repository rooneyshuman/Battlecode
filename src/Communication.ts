import { BCAbstractRobot, SPECS } from 'battlecode';

export function constructCoordMessage(pt: number[]) {
    // Fuel cost: Math.ceil(Math.sqrt(r))
    // pt = [x, y]
    // ex: [1, 1] = 000001000001 = 65
    // ex: [5, 16] = 000101 010000 = 336
    /*
    const xCoord = pt[0] << 6;
    const yCoord = pt[1];
    return xCoord + yCoord;
    */
   return pt[0] * 64 + pt[1];
}

export function parseMessage(message: number) {
    if (message === -1) {
        // TODO: Might want to change to returning an undefined
        return [-1, -1];
    }
    // 6 bits X coords, 6 bits Y coords.
    // Get x coords.
    // ex: [5, 16] = 000101 010000 = 336
    /*
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
            // Do xCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                xCoord += 1 << i - 7; // Offset is 7 b/c, (i - 1) - 6, 6 is from binary offset of x,y
            }
        }
    }
    return [xCoord, yCoord];
    */
   return [Math.floor(message / 64) % 64, message % 64];
}

export function constructCastleTalkMessage(pt: number[], mapSize: number) {
    // Black magic
    const xyBits = 8;
    return xyBits * Math.floor(pt[0] * xyBits / mapSize) + Math.floor(pt[1] * xyBits / mapSize);
}

export function parseCastleTalk(message: number, mapSize: number) {
    const xyBits = 8;
    // const x = Math.floor(0.5 + (Math.floor(message / xyBits) + 0.5) * mapSize / xyBits);
    // const y = Math.floor(0.5 + ((message % xyBits) + 0.5) * mapSize / xyBits);
    const x = Math.floor(0.5 + (Math.floor(message / xyBits) + 0.5) * mapSize / xyBits);
    const y = Math.floor(0.5 + ((message % xyBits) + 0.5) * mapSize / xyBits);
    return [x, y];
}