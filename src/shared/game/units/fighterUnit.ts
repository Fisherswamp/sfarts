import GameUnit from "./gameUnit";
import unitStats from "./unitStats.json";
import { SpecialActionName } from "../move/specialAction";
import Location from "../location";

export default class FighterUnit extends GameUnit {
    constructor(controller: string, team: string, location: Location) {
        super(controller, team, unitStats.fighter, [SpecialActionName.ATTACK], location);
    }
}