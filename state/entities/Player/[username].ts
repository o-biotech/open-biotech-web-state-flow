import { z } from '@zod';
import {
  EntityContext,
  StateFlowEntityActionHandlers,
} from '@fathym/eac/runtime/state-flow';

const Player = z.object({
  Username: z.string().email(),
  GameIDs: z.array(z.string().uuid()),
  Gamertag: z.string().optional(),
  Wins: z.array(z.string().uuid()),
});

type Player = z.infer<typeof Player>;

type Actions = {
  addToGame: (gameId: string) => void;

  addWin: (gameId: string) => void;
};

const Actions: StateFlowEntityActionHandlers<Player, Actions> = {
  $init(ctx): void {
    const username = ctx.Params.username!;

    ctx.Entity = {
      Username: username,
      GameIDs: [],
      Wins: [],
    };
  },
  addToGame(ctx, gameId: string): void {
    ctx.Entity.GameIDs = [...ctx.Entity.GameIDs, gameId];
  },
  addWin(ctx, gameId: string): void {
    ctx.Entity.Wins = [...ctx.Entity.Wins, gameId];
  },
};

export default Player;
export { Actions };
