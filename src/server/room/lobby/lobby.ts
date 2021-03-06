import { User, UserStatus } from "../../manager/userManager";
import Room from "../room";
import LobbySettings from "./lobbySettings";
import { ClientLobby, ClientUser } from "../../../shared/communication/messageInterfaces/lobbyMessage";
import log, { LOG_LEVEL } from "../../../shared/utility/logger";

export default class Lobby implements Room {
    settings: LobbySettings;
    id: string;
    lobbyLeader: number;
    players: number[];
    playerTeamMap: {
        [teamId: number]: {
            [userId: number]: User;
        };
    };

    constructor(id: string, initialPlayer: User, settings: LobbySettings) {
        this.settings = settings;
        this.players = [];
        this.playerTeamMap = {};
        this.id = id;
        for (let i = 0; i < settings.numTeams; i++) {
            this.playerTeamMap[i] = {};
        }
        this.playerJoinTeam(initialPlayer, 0);
        this.lobbyLeader = initialPlayer.id;
    }
    getRoomName(): string {
        return `${this.settings.lobbyName}: ${this.id}`;
    }

    /**
     * This function has a player join a lobby by joining one of the teams in the lobby
     * @param player User object for the player joining
     * @param teamId ID of the team to join
     * @returns whether or not the player was able to join
     */
    playerJoinTeam(player: User, teamId: number): boolean {
        // Have player leave before rejoining to prevent the same player in more than one slot
        // Save the lobby leader since having a player leave a lobby for real resets the lobby leader
        let lobbyLeaderSave = null;
        if (this.lobbyLeader == player.id) {
            lobbyLeaderSave = this.lobbyLeader;
        }
        this.playerLeaveLobby(player);
        if (lobbyLeaderSave) {
            this.lobbyLeader = lobbyLeaderSave;
        }
        const team = this.playerTeamMap[teamId];
        if (team) {
            if (Object.keys(team).length < this.settings.maxPlayersPerTeam) {
                team[player.id] = player;
                player.status = UserStatus.IN_LOBBY;
                this.players.push(player.id);
                return true;
            }
        }
        return false;
    }
    /**
     * This function removes a player from the lobby
     * @param playerLeaving user who has left the lobby
     */
    playerLeaveLobby(playerLeaving: User): void {
        // remove player leaving from list of players
        this.players = this.players.filter((playerId) => playerId != playerLeaving.id);
        for (const teamId of Object.keys(this.playerTeamMap)) {
            const possiblePlayer = this.playerTeamMap[parseInt(teamId)][playerLeaving.id];
            if (possiblePlayer) {
                delete this.playerTeamMap[parseInt(teamId)][playerLeaving.id];
                possiblePlayer.status = UserStatus.ONLINE;
                if (this.lobbyLeader == possiblePlayer.id) {
                    this.lobbyLeader = this.players[0] || null;
                }
                return;
            }
        }
    }

    asClientLobby(): ClientLobby {
        const playerTeamMap: {
            [teamId: number]: {
                [userId: number]: ClientUser;
            };
        } = {};
        Object.keys(this.playerTeamMap).forEach((teamId) => {
            const teamIdInt = parseInt(teamId);
            playerTeamMap[teamIdInt] = {};
            Object.keys(this.playerTeamMap[teamIdInt]).forEach((userId) => {
                const userIdInt = parseInt(userId);
                const user = this.playerTeamMap[teamIdInt][userIdInt];
                playerTeamMap[teamIdInt][userIdInt] = {
                    username: user.username,
                    id: user.id,
                };
            });
        });
        return {
            settings: this.settings,
            id: this.id,
            lobbyLeader: this.lobbyLeader,
            players: this.players,
            playerTeamMap: playerTeamMap,
        };
    }
}
