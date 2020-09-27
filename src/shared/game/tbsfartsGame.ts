import Phaser from "phaser";
import LoginScreen from "./scene/loginScreen";

/**
 * Class that represents the Turn-Based Science Fiction Action Real-Time Strategy Game (tbsfarts)
 */
export default class TbsfartsGame extends Phaser.Game {
    constructor() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 1600,
            height: 900,
            physics: {
                default: "arcade",
            },
        };
        super(config);
        this.scene.add(LoginScreen.getSceneName(), new LoginScreen(), true);
    }
}
