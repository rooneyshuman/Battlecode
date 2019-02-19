import { availableLoc, closestMiningLocation, findClosestFriendlyCastles, simplePathFinder, visiblePilgrims } from "./utils";

export function handlePilgrim(self: any): Action | Falsy {
    self.log(" > > > PILGRIM TIME > > >");
    // let action: Action | Falsy = undefined;
    if (self.me.turn === 1) {
        initializePilgrim(self);
    }
    if (self.destination === undefined) {
        if (self.resourceLocation === undefined) {
            findDiffMining(self);
        }
        self.log(`MY DEST IS ${self.resourceLocation}`)
        self.destination = self.resourceLocation;
        const robotMap = self.getVisibleRobotMap();
        self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
        self.nextMove = self.destinationQueue.pop();
        self.goMining = true;
        self.log(` > > > CLOSEST MINING SPOT AT ${self.destination}> > >`);
        self.log(` > > > NEXT MOVE ${self.nextMove}> > >`);
    }

    let full;

    if (self.me.karbonite === 20 || self.me.fuel === 100) {
        full = true;
        // TODO: Make pilgrim walk back to castle if inventory is full.
        self.log("---FULL INVENTORY, RETURNING TO BASE---");
        self.goMining = false;
        const closestCastle = findClosestFriendlyCastles(self);
        const dx = closestCastle[0] - self.me.x;
        const dy = closestCastle[1] - self.me.y;
        const dist = Math.pow(dx, 2) + Math.pow(dy, 2);

        // If castle is in adjacent square, give resources
        if (dist <= 2) {
            self.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
            return self.give(dx, dy, self.me.karbonite, self.me.fuel);
        }

        // Not near castle, set destination queue to nav to base
        const visibleRobots = self.getVisibleRobotMap()
        const validLoc = availableLoc(self.me.x, self.me.y, visibleRobots, self.map);
        self.destination = [closestCastle[0] + validLoc[0], closestCastle[1] + validLoc[1]];
        self.destinationQueue = simplePathFinder(self.map, visibleRobots, [self.me.x, self.me.y], self.destination);
        self.nextMove = self.destinationQueue.pop();
        self.log(` > > > MY LOCATION (${self.me.x}, ${self.me.y})> > >`);
        self.log(` > > > CLOSEST CASTLE AT ${self.destination}> > >`);
        self.log(` > > > NEXT MOVE ${self.nextMove}> > >`);
    }

    // Mine or set mining location to destination if not full and at location
    if (self.me.x === self.destination[0] && self.me.y === self.destination[1] && !full) {
        // If on destination and is going mining, mine.
        if (self.goMining === true) {
            self.log("CURRENTLY MINING");
            return (self.mine());
        }
        self.destination = undefined;
    }

    if (self.me.turn % 2 === 0) {
        // return pilgrimBuild(self);
    }

    // Move to destination
    if ((self.me.x !== self.nextMove[0]) && (self.me.y !== self.nextMove[1])) {
        const visibleRobots = self.getVisibleRobotMap();
        if (visibleRobots[self.nextMove[1]][self.nextMove[0]] !== 0) {
            self.destinationQueue = [];
            initializePilgrim(self);
        }
        else {
            const moveX = self.nextMove[0] - self.me.x;
            const moveY = self.nextMove[1] - self.me.y;
            return self.move(moveX, moveY);
        }
    }

    if (self.destinationQueue.length !== 0 && ((self.me.x === self.nextMove[0]) && (self.me.y === self.nextMove[1]))) {
        // If the destination queue has coordinates and my current location is the 
        // same as my next move's location, then pop next destination and set nextMove to it.
        self.nextMove = self.destinationQueue.pop();
        const moveX = self.nextMove[0] - self.me.x;
        const moveY = self.nextMove[1] - self.me.y;
        self.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
        return self.move(moveX, moveY);
    }
}

// Sets pilgrims' initial mining job
export function initializePilgrim(self: any) {
    self.log("> > > FINDING THINGS > > >");
    const visibleRobots = self.getVisibleRobotMap();
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`)
    self.resourceLocation = (visiblePilgrims(self) % 2 === 0) ?
        closestMiningLocation([self.me.x, self.me.y], self.karbonite_map, visibleRobots) :
        closestMiningLocation([self.me.x, self.me.y], self.fuel_map, visibleRobots);

    self.log(`VISPILGS < 1: ${visiblePilgrims(self) < 1} RESRC LOC: ${self.resourceLocation}, pilnum${visiblePilgrims(self)}`);
}

export function findDiffMining(self: any) {
    // It's like initializePilgrim, but the opposite.
    const visibleRobots = self.getVisibleRobotMap();
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`)
    self.resourceLocation = ((visiblePilgrims(self) + 1) % 2 === 0) ?
        closestMiningLocation([self.me.x, self.me.y], self.karbonite_map, visibleRobots) :
        closestMiningLocation([self.me.x, self.me.y], self.fuel_map, visibleRobots);
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}