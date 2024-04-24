import { z } from '@zod';
import {
  EntityContext,
  StateFlowEntityActionHandlers,
} from '@fathym/eac/runtime/state-flow';
import { encodeBase64 } from '$std/encoding/base64.ts';

const Games = z.object({
  Codes: z.map(z.string().uuid(), z.string()),
});

type Games = z.infer<typeof Games>;

type Actions = {
  createGame: () => Promise<[string, string]>;
};

const Actions: StateFlowEntityActionHandlers<Games, Actions> = {
  $init(ctx): void {
    ctx.Entity = {
      Codes: new Map<string, string>(),
    };
  },
  async createGame(ctx): Promise<[string, string]> {
    const gameId = crypto.randomUUID();

    const gameCodeHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(gameId)
    );

    const gameCode = encodeBase64(gameCodeHash);

    ctx.Entity.Codes.set(gameId, gameCode);

    return [gameId, gameCode];
  },
};

export default Games;
export { Actions };
