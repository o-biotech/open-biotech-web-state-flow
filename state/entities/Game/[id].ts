import { z } from '@zod';
import { StateFlowEntityActionHandlers } from '@fathym/eac/runtime/state-flow';

const Game = z.object({
  ID: z.string().uuid(),
  Players: z.map(
    z.string(),
    z.object({
      Score: z.number(),
    })
  ),
  Winner: z.string().optional(),
});

type Game = z.infer<typeof Game>;

type Actions = {
  complete: (winner: string) => void;

  newPlayer: (player: string) => void;

  registerScore: (player: string, score: number) => void;
};

const Actions: StateFlowEntityActionHandlers<Game, Actions> = {
  $init(ctx): void {
    const gameId = ctx.Params.id!;

    ctx.Entity = {
      ID: gameId,
      Players: new Map(),
    };
  },
  complete(ctx, winner: string): void {
    ctx.Entity.Winner = winner;
  },
  newPlayer(ctx, player: string): void {
    ctx.Entity.Players.set(player, { Score: 0 });
  },
  registerScore(ctx, player: string, score: number): void {
    const playerEntity = ctx.Entity.Players.get(player)!;

    playerEntity.Score += score;
  },
};

export default Game;
export { Actions };
