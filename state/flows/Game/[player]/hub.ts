import { z } from '@zod';
import {
  PromisifyProperties,
  StateFlowStateActionHandlers,
} from '@fathym/eac/runtime/state-flow';
import Games, { Actions as GamesActions } from '../../../entities/Games.ts';
import Game, { Actions as GameActions } from '../../../entities/Game/[id].ts';
import Player, {
  Actions as PlayerActions,
} from '../../../entities/Player/[username].ts';

const GameHubState = z.object({
  CompleteGames: z.array(
    z.object({
      ID: z.string().uuid(),
      Winner: z.string(),
      Score: z.number(),
    })
  ),
  Games: z.array(
    z.object({
      ID: z.string().uuid(),
      Code: z.string(),
      Players: z.array(z.string().uuid()),
    })
  ),
  JoinableGames: z.array(
    z.object({
      ID: z.string().uuid(),
      Code: z.string(),
      Players: z.array(z.string().uuid()),
    })
  ),
});

type GameHubState = z.infer<typeof GameHubState>;

type Actions = {
  joinGame: (gameId: string) => Promise<void>;

  newGame: () => Promise<void>;
};

const Actions: StateFlowStateActionHandlers<GameHubState, Actions> = {
  async $init(ctx): Promise<void> {
    const gamesEntity = await ctx.Entity<Games>(['Games']);

    const player = ctx.Params.player!;

    const gamesCalls = Array.from(gamesEntity.Codes.entries()).map(
      async ([gameId, gameCode]) => {
        const gameEntity = await ctx.Entity<Game>(['Game', gameId]);

        return {
          ...gameEntity,
          Code: gameCode,
        };
      }
    );

    const games = await Promise.all(gamesCalls);

    const playersCalls = games
      .map((g) => g.Players)
      .flatMap((p) => Array.from(p.keys()))
      .map(async (playerName) => {
        const playerEntity = await ctx.Entity<Player>(['Player', playerName]);

        return [playerEntity.Username, playerEntity] as [
          string,
          typeof playerEntity
        ];
      });

    const players = (await Promise.all(playersCalls)).reduce(
      (acc, [username, playerEntity]) => {
        acc[username] = playerEntity;

        return acc;
      },
      {} as Record<string, Player>
    );

    const currentPlayerEntity = players[player];

    const completeGames = games
      .filter((g) => g.Winner)
      .map((g) => {
        const winnerPlayerEntity = players[g.Winner!];

        return {
          ID: g.ID,
          Score: g.Players.get(g.Winner!)!.Score,
          Winner: winnerPlayerEntity.Gamertag || winnerPlayerEntity.Username,
        };
      });

    const playerGames = games
      .filter((g) => !g.Winner && g.Players.has(currentPlayerEntity.Username))
      .map((g) => {
        return {
          ID: g.ID,
          Code: g.Code,
          Players: Array.from(g.Players.keys()).map((gp) => {
            const gamePlayerEntity = players[gp];

            return gamePlayerEntity.Gamertag || gamePlayerEntity.Username;
          }),
        };
      });

    const joinableGames = games
      .filter((g) => !g.Winner && !g.Players.has(currentPlayerEntity.Username))
      .map((g) => {
        return {
          ID: g.ID,
          Code: g.Code,
          Players: Array.from(g.Players.keys()).map((gp) => {
            const gamePlayerEntity = players[gp];

            return gamePlayerEntity.Gamertag || gamePlayerEntity.Username;
          }),
        };
      });

    ctx.State = {
      CompleteGames: completeGames,
      Games: playerGames,
      JoinableGames: joinableGames,
    };
  },
  async joinGame(ctx, gameId: string): Promise<void> {
    const player = ctx.Params.player!;

    const gameEntity = await ctx.Entity<Game>(['Game', gameId]);

    if (!gameEntity.Players.has(player)) {
      const gameActions = await ctx.Actions<GameActions>(['Game', gameId]);

      const currentPlayerActions = await ctx.Actions<PlayerActions>([
        'Player',
        player,
      ]);
  
      await gameActions.newPlayer(player);
  
      await currentPlayerActions.addToGame(gameId);
    }
  },
  async newGame(ctx): Promise<void> {
    const gamesActions = await ctx.Actions<GamesActions>(['Games']);

    const [gameId, gameCode] = await gamesActions.createGame();

    console.log(gameCode);

    await this.joinGame?.(ctx, gameId);
  },
};

export default GameHubState;
export { Actions };
