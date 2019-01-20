// tslint:disable variable-name member-access
declare type Falsy = null | false | undefined | void | 0 | '';
interface GameState {
  /**
   * The id of the playing robot.
   */
  id: number;
  /**
   * A map of id's of visible robots.
   *
   * The map is represented as a 2 by 2 grid of numbers where a value greater than zero is a robot id.
   * If `shadow[y][x] > 0`, then `shadow[y][x]` is the id of the robot at (x, y).
   */
  shadow: number[][];
  /**
   * An array of visible robots.
   */
  visible: Robot[];
  /**
   * The full map represented as a boolean grid where `true` indicates passable and `false` indicates impassable.
   *
   * This property only contains the full map when {@link Robot.turn} equals 1.
   * If it doesn't equal 1, it contains `[[0], [0]]`.
   * It is therefore recommended to use {@link BCAbstractRobot.map}.
   */
  map: boolean[][] | number[][];
  /**
   * The karbonite map represented as a boolean grid where `true` indicates that karbonite is present and `false` indicates that it is not.
   *
   * This property only contains the karbonite map when {@link Robot.turn} equals 1.
   * If it doesn't equal 1, it contains `[[0], [0]]`.
   * It is therefore recommended to use {@link BCAbstractRobot.karbonite_map}.
   */
  karbonite_map: boolean[][] | number[][];
  /**
   * The fuel map represented as a boolean grid where `true` indicates that fuel is present and `false` indicates that it is not.
   *
   * This property only contains the fuel map when {@link Robot.turn} equals 1.
   * If it doesn't equal 1, it contains `[[0], [0]]`.
   * It is therefore recommended to use {@link BCAbstractRobot.fuel_map}.
   */
  fuel_map: boolean[][] | number[][];
  /**
   * The global amount of karbonite that the team possesses.
   */
  karbonite: number;
  /**
   * The global amount of fuel that the team possesses.
   */
  fuel: number;
  /**
   * A 2 by 2 grid containing the last trade offers by both teams.
   *
   * last_offer[{@link Specs.RED}] is the last offer made by RED and contains an array of two integers.
   * Similarly, last_offer[{@link Specs.BLUE}] is the last offer made by BLUE.
   *
   * The first value in the array of integers is the amount of karbonite and the second one is the amount of fuel.
   * For both offers, a positive amount signifies that the resource goes from RED to BLUE.
   *
   * Available for Castles (always `null` for other units).
   */
  last_offer: number[][] | null;
}
interface Robot {
  /**
   * The id of the robot, which is an integer between 1 and {@link Specs.MAX_ID}.
   *
   * Always available.
   */
  id: number;
  /**
   * The robot's unit type, where {@link Specs.CASTLE} stands for castle,
   * {@link Specs.CHURCH} stands for church, {@link Specs.PILGRIM} stands for pilgrim,
   * {@link Specs.CRUSADER} stands for crusader, {@link Specs.PROPHET} stands for prophet
   * and {@link Specs.PREACHER} stands for preacher.
   *
   * Available if visible.
   */
  unit?: number;
  /**
   * The health of the robot.
   *
   * Only available if {@link BCAbstractRobot.me} equals this robot.
   */
  health?: number;
  /**
   * The team of the robot, where {@link Specs.RED} stands for RED and {@link Specs.BLUE} stands for BLUE.
   *
   * Available if visible.
   */
  team?: number;
  /**
   * The x position of the robot.
   *
   * Available if visible.
   */
  x?: number;
  /**
   * The y position of the robot.
   *
   * Available if visible.
   */
  y?: number;
  /**
   * The amount of fuel that the robot carries.
   *
   * Only available if {@link BCAbstractRobot.me} equals this robot.
   */
  fuel?: number;
  /**
   * The amount of karbonite that the robot carries.
   *
   * Only available if {@link BCAbstractRobot.me} equals this robot.
   */
  karbonite?: number;
  /**
   * The turn count of the robot (initialized to 0, and incremented just before `turn()`).
   *
   * Always available.
   */
  turn: number;
  /**
   * The signal message of the robot.
   *
   * -1 if not radioable.
   */
  signal: number;
  /**
   * The signal radius of the robot.
   *
   * -1 if not radioable.
   */
  signal_radius: number;
  /**
   * The castle talk message sent by the robot.
   *
   * Available if {@link BCAbstractRobot.me} is a Castle.
   */
  castle_talk?: number;
  /**
   * The amount of milliseconds this robot has left in it's chess clock.
   *
   * Only available if {@link BCAbstractRobot.me} equals this robot.
   */
  time?: number;
}
declare module 'battlecode' {
  /**
   * The specifications of the current game.
   */
  const SPECS: Specs;
  /**
   * The abstract class that all implementations should extend from.
   *
   * All the variables and methods starting with an underscore are used to internally to process a turn and create actions.
   */
  abstract class BCAbstractRobot {
    /**
     * The log messages that will be sent this turn.
     *
     * All items in this array are passed through `JSON.stringify` by {@link log}.
     *
     * @private
     */
    _bc_logs: string[];
    /**
     * The latest used signal value.
     *
     * @private
     */
    _bc_signal: number;
    /**
     * The latest used signal radius.
     *
     * @private
     */
    _bc_signal_radius: number;
    /**
     * The latest used castle talk message.
     *
     * @private
     */
    _bc_castle_talk: number;
    /**
     * The current game state.
     *
     * @private
     */
    _bc_game_state: GameState;
    /**
     * The robot object of the playing robot.
     */
    me: Robot;
    /**
     * The id of the playing robot.
     */
    id: number;
    /**
     * The global amount of fuel that the team possesses.
     */
    fuel: number;
    /**
     * The global amount of karbonite that the team possesses.
     */
    karbonite: number;
    /**
     * A 2 by 2 grid containing the last trade offers by both teams.
     *
     * last_offer[{@link Specs.RED}] is the last offer made by RED and contains an array of two integers.
     * Similarly, last_offer[{@link Specs.BLUE}] is the last offer made by BLUE.
     *
     * The first value in the array of integers is the amount of karbonite and the second one is the amount of fuel.
     * For both offers, a positive amount signifies that the resource goes from RED to BLUE.
     *
     * Available for castles (always `null` for other units).
     */
    last_offer: number[][] | null;
    /**
     * The full map represented as a boolean grid where `true` indicates passable and `false` indicates impassable.
     */
    map: boolean[][];
    /**
     * The karbonite map represented as a boolean grid where `true` indicates that karbonite is present and `false` indicates that it is not.
     */
    karbonite_map: boolean[][];
    /**
     * The fuel map represented as a boolean grid where `true` indicates that fuel is present and `false` indicates that it is not.
     */
    fuel_map: boolean[][];
    /**
     * Play a single turn for a robot.
     */
    abstract turn(): Action | Falsy;
    /**
     * Plays a turn and returns the action.
     *
     * @param game_state - The game state to play this robot on
     * @private
     */
    _do_turn(game_state: GameState): Action;
    /**
     * Resets the state of the robot.
     *
     * @private
     */
    _bc_reset_state(): void;
    /**
     * Creates a base action with the default properties which all actions have.
     *
     * @private
     */
    _bc_null_action(): Action;
    /**
     * Creates an error action.
     *
     * If the error has a stack, the message is the stack.
     * It the error does not have a stack, the message is set to `e.toString()`.
     *
     * @param e the error to use to create the action
     * @private
     */
    _bc_error_action(e: Error): ErrorAction;
    /**
     * @param action - The name of the action
     * @param properties - Additional properties to add to the standard action
     * @private
     */
    _bc_action(
      action: string,
      properties: {
        [key: string]: any;
      },
    ): Action;
    /**
     * Checks whether the coordinates are on the map.
     *
     * @param x - The x coordinate to check
     * @param y - The y coordinate to check
     * @private
     */
    _bc_check_on_map(x: number, y: number): boolean;
    /**
     * Print a message to the command line. You cannot use ordinary `console.log` in Battlecode for security reasons.
     *
     * The message is converted to a string using `JSON.stringify`.
     *
     * @param message - The message to log
     */
    log(message: any): void;
    /**
     * Broadcast `value` to all robots within the squared radius `sq_radius`. Uses `sq_radius` Fuel.
     * Can be called multiple times in one `turn()`; however, only the most recent signal will be used, while each signal will cost fuel.
     *
     * @param value - The value to signal, which should be between 0 and 2^{@link Specs.COMMUNICATION_BITS}-1 (inclusive)
     * @param radius - The radius to signal in
     */
    signal(value: number, radius: number): void;
    /**
     * Broadcast `value` to all castles of the same team. Does not use fuel.
     * Can be called multiple times in one `turn()`; however, only the most recent castle talk will be used.
     *
     * @param value - The number to broadcast, which should be between 0 and 2^{@link Specs.CASTLE_TALK_BITS}-1 (inclusive)
     */
    castleTalk(value: number): void;
    /**
     * Propose a trade with the other team. `karbonite` and `fuel` need to be integers.
     *
     * For example, for RED to make the offer "I give you 10 Karbonite if you give me 10 Fuel", the parameters
     * would be `karbonite = 10` and `fuel = -10` (for BLUE, the signs are reversed).
     *
     * If the proposed trade is the same as the other team's `last_offer`, a trade is performed, after which the `last_offer` of both teams will be nullified.
     *
     * Only available for castles.
     *
     * @param karbonite - The amount of karbonite to propose
     * @param fuel - The amount of fuel to propose
     */
    proposeTrade(karbonite: number, fuel: number): TradeAction;
    /**
     * Build a unit of the type `unit` (integer, see `r.unit`) in the tile that is `dx` steps in the x direction and `dy` steps in the y direction from `this.me`.
     * Can only build in adjacent, empty and passable tiles.
     *
     * Uses {@link UnitSpecs.CONSTRUCTION_FUEL} fuel and {@link UnitSpecs.CONSTRUCTION_KARBONITE} karbonite (depending on the constructed unit).
     *
     * Available for pilgrims, castles and churches.
     *
     * Pilgrims can only build churches.
     * Castles and churches can only build pilgrims, crusaders, prophets and preachers.
     *
     * @param unit - The type of the unit to build
     * @param dx - The amount of steps away in the x direction to build
     * @param dy - The amount of steps away in the y direction to build
     */
    buildUnit(unit: number, dx: number, dy: number): BuildAction;
    /**
     * Move `dx` steps in the x direction, and `dy` steps in the y direction.
     *
     * Uses fuel (depending on unit and distance).
     *
     * Available for pilgrims, crusaders, prophets, preachers.
     *
     * @param dx - The amount of steps to move in the x direction
     * @param dy - The amount of steps to move in the y direction
     */
    move(dx: number, dy: number): MoveAction;
    /**
     * Mine {@link Specs.KARBONITE_YIELD} karbonite or {@link Specs.FUEL_YIELD} fuel, if on a corresponding resource tile.
     *
     * Uses {@link Specs.MINE_FUEL_COST} fuel. Available for pilgrims.
     */
    mine(): MineAction;
    /**
     * Give `karbonite` karbonite and `fuel` fuel to the robot in the tile that is `dx` steps in the x direction and `dy` steps in the y direction from `this.me`.
     * A robot can only give to another robot that is in one of its 8 adjacent tiles, and cannot give more than it has.
     *
     * Uses 0 Fuel.
     *
     * Available for all robots.
     *
     * If a unit tries to give a robot more than its capacity, the excess is loss to the void.
     *
     * @param dx - The amount of steps away the receiving robot is in the x direction
     * @param dy - The amount of steps away the receiving robot is in the y direction
     * @param karbonite - The amount of karbonite to give to the receiving robot
     * @param fuel - The amount of fuel to give to the receiving robot
     */
    give(dx: number, dy: number, karbonite: number, fuel: number): GiveAction;
    /**
     * Attack the robot in the tile that is `dx` steps in the x direction and `dy` steps in the y direction from `this.me`.
     * A robot can only attack another robot that is within its attack radius (depending on unit).
     *
     * Uses fuel (depending on unit).
     *
     * Available for crusaders, prophets and preachers.
     *
     * @param dx - The amount of steps away the attacked robot is in the x direction
     * @param dy - The amount of steps away the attacked robot is in the y direction
     */
    attack(dx: number, dy: number): AttackAction;
    /**
     * Returns a robot object with the given integer `id`.
     *
     * Returns `null` if such a robot is not in your vision (for castles, it also
     * returns a robot object for all robots on `this.me`'s team that are not in
     * the robot's vision, to access `castle_talk`).
     *
     * @param id - The id of the robot to retrieve
     */
    getRobot(id: number): Robot;
    /**
     * Returns `true` if the given robot object is visible.
     *
     * @param robot - The robot to check
     */
    isVisible(robot: Robot): boolean;
    /**
     * Returns `true` if the given robot object is currently sending radio (signal).
     *
     * @param robot - The robot to check
     */
    isRadioing(robot: Robot): boolean;
    /**
     * Returns {@link GameState.shadow}.
     */
    getVisibleRobotMap(): number[][];
    /**
     * Returns {@link map}.
     */
    getPassableMap(): boolean[][];
    /**
     * Returns {@link karbonite_map}.
     */
    getKarboniteMap(): boolean[][];
    /**
     * Returns {@link fuel_map}.
     */
    getFuelMap(): boolean[][];
    /**
     * Returns {@link GameState.visible}.
     */
    getVisibleRobots(): Robot[];
  }
}
interface Action {
  /**
   * The message to signal to all units within squared radius {@link signal_radius}^2.
   *
   * The message can be at most {@link Specs.COMMUNICATION_BITS} bits.
   */
  signal: number;
  /**
   * The distance to signal in.
   */
  signal_radius: number;
  /**
   * Messages that need to be logged.
   */
  logs: string[];
  /**
   * The message to send to all castles owned by the player.
   *
   * The message can be at most {@link Specs.CASTLE_TALK_BITS} bits.
   */
  castle_talk: number;
}
interface AttackAction extends Action {
  /**
   * The type of this action.
   */
  action: 'attack';
  /**
   * The amount of steps away the targeted robot is in the x direction.
   */
  dx: number;
  /**
   * The amount of steps away the targeted robot is in the y direction.
   */
  dy: number;
}
interface BuildAction extends Action {
  /**
   * The type of this action.
   */
  action: 'build';
  /**
   * The type of the unit to build.
   */
  build_unit: number;
  /**
   * The amount of steps away in the x direction to build.
   */
  dx: number;
  /**
   * The amount of steps away in the y direction to build.
   */
  dy: number;
}
interface ErrorAction extends Action {
  /**
   * The message of the error.
   */
  error: string;
}
interface GiveAction extends Action {
  /**
   * The type of this action.
   */
  action: 'give';
  /**
   * The amount of karbonite to give to the receiving robot.
   */
  give_karbonite: number;
  /**
   * The amount of fuel to give to the receiving robot.
   */
  give_fuel: number;
  /**
   * The amount of steps away the receiving robot is in the x direction.
   */
  dx: number;
  /**
   * The amount of steps away the receiving robot is in the y direction.
   */
  dy: number;
}
interface MineAction extends Action {
  /**
   * The type of this action.
   */
  action: 'mine';
}
interface MoveAction extends Action {
  /**
   * The type of this action.
   */
  action: 'move';
  /**
   * The amount of steps to move in the x direction.
   */
  dx: number;
  /**
   * The amount of steps to move in the y direction.
   */
  dy: number;
}
interface TradeAction extends Action {
  /**
   * The type of this action.
   */
  action: 'trade';
  /**
   * The amount of fuel to propose.
   *
   * If the amount if positive, the player is offering fuel to the opponent.
   * If the amount is negative, the player is asking fuel from the opponent.
   */
  trade_fuel: number;
  /**
   * The amount of karbonite to propose.
   *
   * If the amount if positive, the player is offering karbonite to the opponent.
   * If the amount is negative, the player is asking karbonite from the opponent.
   */
  trade_karbonite: number;
}
interface Specs {
  /**
   * The amount of bits that can be used when signaling (default: 16).
   */
  COMMUNICATION_BITS: number;
  /**
   * The amount of bits that can be used when sending a message to the castles (default: 8).
   */
  CASTLE_TALK_BITS: number;
  /**
   * The maximum amount of rounds this game can take (default: 1000).
   */
  MAX_ROUNDS: number;
  /**
   * The amount of fuel that is given per turn (default: 25).
   */
  TRICKLE_FUEL: number;
  /**
   * The initial amount of karbonite every player starts with (default: 100).
   */
  INITIAL_KARBONITE: number;
  /**
   * The initial amount of fuel every player starts with (default: 500).
   */
  INITIAL_FUEL: number;
  /**
   * The amount of fuel it costs to mine once (default: 1).
   */
  MINE_FUEL_COST: number;
  /**
   * The amount of karbonite that can be mined from fields with karbonite (default: 2).
   */
  KARBONITE_YIELD: number;
  /**
   * The amount of karbonite that can be mined from fields with fuel (default: 10).
   */
  FUEL_YIELD: number;
  /**
   * The maximum amount of goods that can be traded in a single turn (default: 1024).
   */
  MAX_TRADE: number;
  /**
   * The maximum board size (default: 64).
   */
  MAX_BOARD_SIZE: number;
  /**
   * The maximum id of a unit (default: 4096).
   */
  MAX_ID: number;
  /**
   * The id of the castle type (default: 0).
   */
  CASTLE: number;
  /**
   * The id of the church type (default: 1).
   */
  CHURCH: number;
  /**
   * The id of the pilgrim unit type (default: 2).
   */
  PILGRIM: number;
  /**
   * The id of the crusader unit type (default: 3).
   */
  CRUSADER: number;
  /**
   * The id of the prophet unit type (default: 4).
   */
  PROPHET: number;
  /**
   * The id of the preacher unit type (default: 5).
   */
  PREACHER: number;
  /**
   * The id of the red team (default: 0).
   */
  RED: number;
  /**
   * The id of the blue team (default: 1).
   */
  BLUE: number;
  /**
   * The initial amount of milliseconds that is given to every robot (default: 100).
   */
  CHESS_INITIAL: number;
  /**
   * The amount of extra milliseconds that a robot is given every turn (default: 20).
   */
  CHESS_EXTRA: number;
  /**
   * The maximum amount of memory your robot can use in bytes (default: 50000000).
   *
   * At the time of writing, this limit is not enforced.
   * It is unclear whether this will change later in the competition.
   */
  MAX_MEMORY: number;
  /**
   * An array of specs of all the different units.
   *
   * Valid indexes are:
   * - {@link CASTLE}
   * - {@link CHURCH}
   * - {@link PILGRIM}
   * - {@link CRUSADER}
   * - {@link PROPHET}
   * - {@link PREACHER}
   */
  UNITS: UnitSpecs[];
}
interface UnitSpecs {
  /**
   * The amount of karbonite it costs to construct this unit.
   */
  CONSTRUCTION_KARBONITE: number | null;
  /**
   * The amount of fuel it costs to construct this unit.
   */
  CONSTRUCTION_FUEL: number | null;
  /**
   * The amount of karbonite this unit can carry.
   */
  KARBONITE_CAPACITY: number | null;
  /**
   * The amount of fuel this unit can carry.
   */
  FUEL_CAPACITY: number | null;
  /**
   * The speed of this unit. 0 if this unit can't move.
   */
  SPEED: number;
  /**
   * The amount of fuel this unit needs per move.
   */
  FUEL_PER_MOVE: number | null;
  /**
   * The amount of hp this unit starts with.
   */
  STARTING_HP: number;
  /**
   * The distance this unit can see.
   */
  VISION_RADIUS: number;
  /**
   * The amount of damage this unit does when attacking.
   */
  ATTACK_DAMAGE: number | null;
  /**
   * An array specifying the minimum and maximum distance in which this unit can attack.
   */
  ATTACK_RADIUS: [number, number] | null;
  /**
   * The amount of fuel it takes for this unit to attack.
   */
  ATTACK_FUEL_COST: number | null;
  /**
   * How big the spread of this unit is when attacking.
   */
  DAMAGE_SPREAD: number | null;
}
