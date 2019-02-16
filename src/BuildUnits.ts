import { BCAbstractRobot, SPECS } from 'battlecode';
import { availableLoc, visiblePilgrims } from "./utils";

interface UnitCountInterface {
    pilgrim: number,
    prophet: number,
    crusader: number,
    preacher: number
}

export function castleBuild(self: BCAbstractRobot, unitCount: UnitCountInterface ): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap, self.map);
    // Easier for individual unit type testing.
    const allowUnitAmt = {
        pilgrim: 10,
        prophet: 0,
        crusader: 0,
        preacher: 0,
    };

    self.log(`Castle health: ${self.me.health}`);

     // Pilgrims have been killed off, build new ones
     const pilgrimNum = visiblePilgrims(self)
     if (pilgrimNum < 2 && buildLoc && unitCount.pilgrim < allowUnitAmt.pilgrim) {
        self.log(`PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        unitCount.pilgrim += 1;
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and if enough karb for prophet
    if (self.karbonite >= 25 && buildLoc && (unitCount.prophet < allowUnitAmt.prophet)) {
        unitCount.prophet += 1;
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and enough karb for pilgrim 
    else if (self.karbonite >= 10 && buildLoc && self.me.turn % 500){
        // FIXME: Set to 500 for now until pilgrims are fixed.
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        unitCount.pilgrim += 1;
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}