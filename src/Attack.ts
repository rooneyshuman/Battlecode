import {BCAbstractRobot, SPECS} from 'battlecode';

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
	for(i = 0; i < listLength; ++ i)
	{
		// Check if the robot just showed up because of radio broadcast
		if(!self.isVisible(visibleRobots[i]))
		{continue;}
		// Check if robot is friendly
		if(self.me.team === visibleRobots[i].team)
		{continue;}
		self.log("ROBOT: " + visibleRobots[i].id + " is an enemy within vision");

	}	
}
// export default Attack;