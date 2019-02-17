import { BCAbstractRobot, SPECS } from 'battlecode';
import { availableLoc, visiblePilgrims } from "./utils";

export function castleBuild(self: BCAbstractRobot): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap, self.map);

    self.log(`Castle health: ${self.me.health}`);

     // Pilgrims have been killed off, build new ones
     const pilgrimNum = visiblePilgrims(self)
     if (pilgrimNum < 2 && buildLoc) {
        self.log(`PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and if enough karb for prophet
    if (self.karbonite >= 25 && buildLoc) {
        // Temporarily only build 1 prophet
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and enough karb for pilgrim 
	/*
    else if (self.karbonite >= 10 && buildLoc && (self.me.turn % 1000)){
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
	*/
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}