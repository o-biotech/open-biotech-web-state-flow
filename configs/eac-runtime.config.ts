import { defineEaCConfig, EaCRuntime } from '@fathym/eac/runtime';
import { StateFlowCorePlugin, StateFlowEaCRuntime } from '@fathym/eac/runtime/state-flow';
import OpenBiotechWebStateFlowPlugin from '../src/plugins/OpenBiotechWebStateFlowPlugin.ts';

export const config = defineEaCConfig({
  Runtime: (cfg) => new StateFlowEaCRuntime(cfg),
  Plugins: [new StateFlowCorePlugin(), new OpenBiotechWebStateFlowPlugin()],
});

export function configure(_rt: EaCRuntime): Promise<void> {
  return Promise.resolve();
}
