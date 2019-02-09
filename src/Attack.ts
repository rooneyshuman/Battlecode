import {BCAbstractRobot, SPECS} from 'battlecode';
import {closestCoords, closestMiningLocation, enemyCastle, findClosestFriendlyCastles, horizontalFlip, randomValidLoc, simplePathFinder, simpleValidLoc} from "./utils";

// const Attack = {};
// Attack.attackFirst = (self) => 
export function attackFirst(self: any) 
{
	// Get all visible robots within the robots vision radius
	const visibleRobots = self.getVisibleRobots();

	// Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range\
	const listLength = visibleRobots.length;
	// let x = 0; // keep track of number of robots in attackableRobots array
	let i;
	const robotToAttack = new Array(2);
	let priorityRobot = -1;
	for(i = 0; i < listLength; ++ i)
	{
		const rob = visibleRobots[i];
		// Check if the robot just showed up because of radio broadcast
		if(!self.isVisible(rob))
		{continue;}
		// Check if robot is friendly 
		if(self.me.team === rob.team)
		{continue;}
		self.log("ROBOT: " + rob.id + " is an enemy within vision");
		
        const dist = (rob.x - self.me.x)**2 + (rob.y - self.me.y)**2;
		if(SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist && dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1])
		{
			self.log("CAN ATTACK ROBOT:" + rob.id);
			// the priority of the robot that is within attacking vision if it is higher than the current one switch over to that robot
			let priority = 0;
			switch (rob.unit) {
				case SPECS.PILGRIM: {
					priority = 0;
				}
				case SPECS.CRUSADER: {
					priority = 2;
				}
				case SPECS.CASTLE: {
					priority = 1;
				}
				case SPECS.PROPHET: {
					priority = 4;
				}
				case SPECS.PREACHER: {
					priority = 3;
				}
			}
			
			if(priority > priorityRobot){
				robotToAttack[0] = rob.x - self.me.x;
				robotToAttack[1] = rob.y - self.me.y;
				priorityRobot = priority;
			}
		}
	}	
	if(priorityRobot === -1)
	{
		return null;
	}
	return robotToAttack;
}


export function rushCastle(self: any, dest: number[], destQ: number[][])
{
	let nextMove: number[];
	self.log("DSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
	nextMove = destQ.pop();
	self.log("LOOOK HERE" + nextMove[0] +", " + nextMove[1]);
	self.log("DDSADASD " + self.me.x + ", " + self.me.y);

    if(destQ.length !== 0 && ((self.me.x === nextMove[0]) && (self.me.y === nextMove[1]))) {
    // If the destination queue has coordinates and my current location is the 
    // same as my next move's location, then pop next destination and set nextMove to it.
    nextMove = destQ.pop();
    const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    self.log(`* * * * * MOVING ${moveX}, ${moveY} > > >`)
    return self.move(moveX, moveY);
  }
  else {
	const moveX = nextMove[0] - self.me.x;
    const moveY = nextMove[1] - self.me.y;
    self.log(`**** ME ${self.me.x}, ${self.me.y} > > >`)
    self.log(`***** nextMove ${nextMove} > > >`)
    self.log(`*(**** MOVING ${moveX}, ${moveY} > > >`)
    self.log(`****DEST ${dest} > > >`)
    return self.move(moveX, moveY);
  }

}