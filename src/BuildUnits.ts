import { BCAbstractRobot, SPECS } from 'battlecode';
import { availableLoc, visiblePilgrims } from "./utils";

export function castleBuild(self: BCAbstractRobot): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap);

    self.log(`Castle health: ${self.me.health}`);

     // Pilgrims have been killed off, build new ones
     if (visiblePilgrims(self) < 2) {
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Repeat while castle has enough karbonite for at least one pilgrim
    if (self.karbonite >= 25) {
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
    }
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}