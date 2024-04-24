import { EaCRuntimeConfig, EaCRuntimePlugin, EaCRuntimePluginConfig } from '@fathym/eac/runtime';
import { IoCContainer } from '@fathym/ioc';
import { StateFlowRuntimeEaC } from '@fathym/eac/runtime/state-flow';
import { EaCDenoKVDatabaseDetails, EaCLocalDistributedFileSystem } from '@fathym/eac';

export default class OpenBiotechWebStateFlowPlugin implements EaCRuntimePlugin {
  public Build(config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig<StateFlowRuntimeEaC> = {
      Name: 'StateFlowCorePlugin',
      IoC: new IoCContainer(),
      EaC: {
        States: {
          'o-biotech': {
            Details: {
              Name: 'Open Biotech Web State',
              Description: 'The Open Biotech Web State',
              DFSLookup: 'local:state/flows',
              EntitiesDFSLookup: 'local:state/entities',
              Priority: 1000,
            },
            ResolverConfigs: {
              dev: {
                Hostname: 'localhost',
                Path: '*',
                Port: config.Server.port,
              },
            },
          },
        },
        DFS: {
          'local:state/entities': {
            Type: 'Local',
            FileRoot: './state/entities/',
            DefaultFile: 'index.ts',
            Extensions: ['ts'],
          } as EaCLocalDistributedFileSystem,
          'local:state/flows': {
            Type: 'Local',
            FileRoot: './state/flows/',
            DefaultFile: 'index.ts',
            Extensions: ['ts'],
          } as EaCLocalDistributedFileSystem,
        },
        Databases: {
          entities: {
            Details: {
              Type: 'DenoKV',
              Name: 'State Entities Storage',
              Description: 'The Deno KV database to use for storing state entities',
              DenoKVPath: Deno.env.get('ENTITIES_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDatabaseDetails,
          },
          state: {
            Details: {
              Type: 'DenoKV',
              Name: 'State Storage',
              Description: 'The Deno KV database to use for storing state',
              DenoKVPath: Deno.env.get('STATE_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDatabaseDetails,
          },
        },
      },
    };

    // pluginConfig.IoC!.Register(PreactRenderHandler, () => {
    //   return new PreactRenderHandler(preactOptions);
    // });

    return Promise.resolve(pluginConfig);
  }
}
