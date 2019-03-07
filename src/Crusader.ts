import { SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { checkerBoardMovement } from "./Nav";
import { availableLoc, enemyCastle, horizontalFlip, manhatDist, simplePathFinder, visibleCrusaders } from "./utils"

export function handleCrusader(self: any): Action | Falsy {
    if (self.me.turn === 1) {
        self.log("> > CRUSADER FIRST TURN > >")
        crusaderInit(self);
    }

    const attackingCoordinates = attackFirst(self);

    if (attackingCoordinates) {
        return self.attack(attackingCoordinates[0], attackingCoordinates[1]);
    }

    // Collect crusaders, have them rush when there are 10
    if (visibleCrusaders(self) >= 3) {
        self.rush = true;
    }

    if (self.rush) {
        return rushCrusader(self);
    }

    else {
        return checkerBoardMovement(self);
    }
}

function crusaderInit(self: any) {
    const visibleRobots = self.getVisibleRobots();
    const robotMap = self.getVisibleRobotMap();
    const listLength = visibleRobots.length;
    for (let i = 0; i < listLength; ++i) {
        const rob = visibleRobots[i];
        if (rob.unit === SPECS.CASTLE) {
            const horizontal = horizontalFlip(self);
            const enemyCastleLoc = enemyCastle([rob.x, rob.y], self.map, horizontal);
            self.friendlyCastleLoc.push([rob.x, rob.y]);
            self.enemyCastleLoc.push(enemyCastleLoc);
            self.destination = self.enemyCastleLoc[self.enemyCastleNum];
            self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
            self.log("CASTLE LOCATION - CRUSADER " + self.enemyCastleLoc[self.enemyCastleNum][0] + ", " + self.enemyCastleLoc[self.enemyCastleNum][1]);
        }
    }
    self.log("dest: " + self.destination);
    self.log("destQ.len " + self.destinationQueue.length);
}

function rushCrusader(self: any) {
    let toMove: any[];
    self.log("> > !!!!!!CRUSADER RUSHING!!!!! > > from " + self.me.x + "," + self.me.y);
    if (self.destination === undefined || self.destinationQueue.length === 0) {
        crusaderInit(self);
    }
    // DestinationQueue is still undefined for some reason, just move anywhere available
    toMove = (self.destinationQueue.length === 0)
        ? availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map)
        : rushCastle(self, self.destination, self.destinationQueue);

    self.log("toMove = " + toMove);
    if (toMove === null) {
        self.log("NO AVAILABLE MOVES");
        return null;
    }
    return (self.move(toMove[0], toMove[1]));
}




