import { BCAbstractRobot, SPECS } from 'battlecode';

export function castleBuild(self: any): BuildAction | Falsy {
    const units: number[] = [1, 2, 3, 4];
    const unitToBuild = units[Math.floor(Math.random() * units.length)];

    self.log(`Castle health: ${self.me.health}`);

    if (self.step % 10 === 0) {
        const buildLoc: number[] = self.randomValidLoc();
        switch (unitToBuild) {
            case 1: {
                self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]})`);
                return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
            }
            case 2: {
                self.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]})`);
                return self.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
            }
            case 3: {
                self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]})`);
                return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
            }
            case 4: {
                self.log(`Building a preacher at (${buildLoc[0]}, ${buildLoc[1]})`);
                return self.buildUnit(SPECS.PREACHER, buildLoc[0], buildLoc[1]);
            }
        }
    }
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}