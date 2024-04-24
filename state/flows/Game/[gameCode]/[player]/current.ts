import { z } from '@zod';
import { StateFlowStateActionHandlers } from '@fathym/eac/runtime/state-flow';
import Game, {
  Actions as GameActions,
} from '../../../../entities/Game/[id].ts';
import Games, { Actions as GamesActions } from '../../../../entities/Games.ts';
import Player, {
  Actions as PlayerActions,
} from '../../../../entities/Player/[username].ts';

const CurrentGamePlayerState = z.object({
  Username: z.string(),
  Details: z.object({
    DisplayName: z.string(),
    TotalWins: z.number(),
  }),
  Score: z.number(),
});

const CurrentGameState = z.object({
  Game: z.object({
    ID: z.string().uuid(),
    Complete: z.boolean(),
  }),
  Player: CurrentGamePlayerState,
  Opponents: z.map(z.string(), CurrentGamePlayerState),
});

type CurrentGameState = z.infer<typeof CurrentGameState>;

type Actions = {
  registerScore: (score: number) => Promise<void>;
};

const Actions: StateFlowStateActionHandlers<CurrentGameState, Actions> = {
  async $init(ctx): Promise<void> {
    const gameCode = ctx.Params.gameCode;

    const gamesEntity = await ctx.Entity<Games>(['Games']);

    const gameId =
      Array.from(gamesEntity.Codes.entries()).find(
        ([_gameId, gc]) => gc === gameCode
      )?.[0] || undefined;

    if (!gameId) {
      throw new Deno.errors.NotFound(
        `The game for '${gameCode}' does not exist.`
      );
    }

    const gameEntity = await ctx.Entity<Game>(['Game', gameId]);

    const player = ctx.Params.player!;

    const currentPlayerEntity = await ctx.Entity<Player>(['Player', player]);

    ctx.State = {
      Game: {
        ID: gameId,
        Complete: !gameEntity.Winner,
      },
      Player: {
        Username: player,
        Details: {
          DisplayName: currentPlayerEntity.Gamertag || player,
          TotalWins: Array.from(currentPlayerEntity.Wins.keys()).length,
        },
        Score: gameEntity.Players.get(player)!.Score,
      },
      Opponents: new Map(),
    };

    for (const [opponent, oppEntry] of gameEntity.Players.entries()) {
      if (opponent !== player) {
        const opponentEntity = await ctx.Entity<Player>(['Player', opponent]);

        ctx.State.Opponents.set(opponent, {
          Username: opponent,
          Details: {
            DisplayName: opponentEntity.Gamertag || opponent,
            TotalWins: Array.from(opponentEntity.Wins.keys()).length,
          },
          Score: oppEntry.Score,
        });
      }
    }
  },
  async registerScore(ctx, score: number): Promise<void> {
    const gameEntity = await ctx.Entity<Game>(['Game', ctx.State.Game.ID]);

    const gameActions = await ctx.Actions<GameActions>([
      'Game',
      ctx.State.Game.ID,
    ]);

    gameActions.registerScore(ctx.State.Player.Username, score);

    if (ctx.State.Player.Score > 5000) {
      const currentPlayerActions = await ctx.Actions<PlayerActions>([
        'Player',
        ctx.State.Player.Username,
      ]);

      currentPlayerActions.addWin(gameEntity.ID);

      gameActions.complete(ctx.State.Player.Username);
    }
  },
};

export default CurrentGameState;
export { Actions };
