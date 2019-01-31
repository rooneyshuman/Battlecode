import { BCAbstractRobot, SPECS } from 'battlecode';

const adjChoices: number[][] = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
];

export function simpleValidLoc(self: BCAbstractRobot): number[] {
    let i = 0;
    while (!self.map[self.me.y + adjChoices[i][1]][self.me.x + adjChoices[i][0]] && i < adjChoices.length) {
      // Makes sure the terrain is passable.
      // self.map is indexed as [y][x]
      i++;
    }
    return adjChoices[i];
}

export function randomValidLoc(self: BCAbstractRobot): number[] {
    // TODO: Possibly check if a unit is in the desired space for movement?
    const mapDim = self.map[0].length
    let rand = Math.floor(Math.random() * adjChoices.length);
    let loc = adjChoices[rand];
    let counter = 0;

    do {
      if (self.me.y + loc[1] >= mapDim) {
        loc[1] = -1;
      }
      if (self.me.y + loc[1] < 0) {
        loc[1] = 1;
      }
      if (self.me.x + loc[0] >= mapDim) {
        loc[0] = -1;
      }
      if (self.me.x + loc[0] < 0) {
        loc[0] = 1;
      }
      rand = (rand + 1) % adjChoices.length;
      counter++;
    } while (!self.map[self.me.y + loc[1]][self.me.x + loc[0]] && counter < adjChoices.length);
    if (counter >= adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }