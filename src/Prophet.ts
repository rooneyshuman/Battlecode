import { SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { availableLoc, enemyCastle, horizontalFlip, simplePathFinder } from "./utils"
import { checkerBoardMovement } from "./Nav";

export function handleProphet(self: any): Action | Falsy {
	if (self.me.turn === 1) {
		self.log("> > PROPHET FIRST TURN > >")
		const visibleRobots = self.getVisibleRobots();
		const robotMap = self.getVisibleRobotMap();
		const listLength = visibleRobots.length;
		for (let i = 0; i < listLength; ++i) {
			const rob = visibleRobots[i];
			if (rob.unit === SPECS.CASTLE) {
				const horizontal = horizontalFlip(self.map);
				const enemyCastleLoc = enemyCastle([rob.x, rob.y], self.map, horizontal);
				self.friendlyCastleLoc.push([rob.x, rob.y]);
				self.enemyCastleLoc.push(enemyCastleLoc);
				self.destination = self.enemyCastleLoc[self.enemyCastleNum];
				self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
				self.log("CASTLE LOCATION - PROPHET" + self.enemyCastleLoc[self.enemyCastleNum][0] + ", " + self.enemyCastleLoc[self.enemyCastleNum][1]);
			}
		}
	}

	const attackingCoordinates = attackFirst(self);

	if (attackingCoordinates) {
		return self.attack(attackingCoordinates[0], attackingCoordinates[1]);
	}

	if (self.me.turn % 12 === 0) {
		return rushProphet(self);
	}
	else {
		return checkerBoardMovement(self);
	}
}

function rushProphet(self: any) {
	if (self.runPathAgain > 1) {
		const choice: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
		self.runPathAgain--;
		return self.move(choice[0], choice[1]);
	}
	else if (self.runPathAgain === 1) {
		self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(), [self.me.x, self.me.y], self.destination);
		self.runPathAgain--;
	}

	if (self.enemyCastleLoc !== null && (self.destinationQueue !== undefined && self.destinationQueue.length !== 0)) {
		const toMove = rushCastle(self, self.destination, self.destinationQueue);
		if (toMove === null) {
			self.runPathAgain = 2;
		}
		else {
			return self.move(toMove[0], toMove[1]);
		}
	}

	if (self.destinationQueue.length === 0) {
		self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(), [self.me.x, self.me.y], self.destination);
	}

	const choicer: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
	return self.move(choicer[0], choicer[1]);
}