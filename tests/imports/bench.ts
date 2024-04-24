import { StateFlowStateActionHandler, z } from '../test.deps.ts';
import { Actions as GameActions } from '../../state/flows/Game/[player]/hub.ts';

Deno.test('Zod Bench', async (t) => {
  await t.step('Import', async () => {
    const path = import.meta.resolve('../../state/flows/Game/[player]/hub.ts');
    try {
      const iModule = await import(path);

      //   const actions: typeof iModule.Actions = iModule.Actions;

      //   type moduleType = typeof iModule;

      const actions = Object.keys(iModule.Actions)
        .filter((k) => !k.startsWith('$'))
        .reduce((acc, k) => {
          const actionType = iModule.Actions[k];

          const action = (...args: any[]) => { ///: OmitFirstArg<typeof actionType>
            console.log(args);
          };
          acc[k] = action;

          return acc;
        }, {} as any) as GameActions;

      const jg = actions.joinGame;

      type jg = ReturnType<typeof jg>;

      console.log(actions);
      console.log(actions.joinGame);

      actions.joinGame('xyz');
    } catch (err) {
      console.error(err);
    }
  });
});
