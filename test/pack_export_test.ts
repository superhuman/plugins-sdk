import {AgentDefinitionBuilder} from '../builder';
import {PackDefinitionBuilder} from '../builder';
import {PackMetadataValidationError} from '../testing/upload_validation';
import type {PackVersionDefinition} from '../types';
import {createFakePackVersionMetadata} from './test_utils';
import {executeFormulaOrSyncWithVM} from '../testing/execution';
import fs from 'fs';
import {importManifest} from '../cli/helpers';
import {newAgent} from '../builder';
import {newConnector} from '../builder';
import {newPack} from '../builder';
import * as packCompiler from '../testing/compile';
import path from 'path';
import {rejects} from 'assert';
import {strictEqual} from 'assert';
import {validatePackDefinitionExports} from '../helpers/pack_exports';
import {validatePackVersionMetadata} from '../testing/upload_validation';

describe('pack export aliases', () => {
  const pack = {id: 1};
  const agent = {id: 2, agent: {tools: []}};
  const connector = {id: 3};
  const manifest = {id: 4};

  it('accepts one export, and a legacy manifest beside it', () => {
    validatePackDefinitionExports({pack});
    validatePackDefinitionExports({connector});
    validatePackDefinitionExports({agent});
    validatePackDefinitionExports({pack, manifest});
    validatePackDefinitionExports({agent, manifest});
    validatePackDefinitionExports({connector, manifest});
    validatePackDefinitionExports({manifest});
    validatePackDefinitionExports({pack: {}});
    validatePackDefinitionExports({manifest: {}});
    // A legacy pack export may still define an agent.
    validatePackDefinitionExports({pack: {agent: {tools: []}}});
  });

  it('ignores a malformed manifest when a modern export is selected', () => {
    for (const definition of [undefined, null, 1, [], () => undefined]) {
      validatePackDefinitionExports({agent, manifest: definition});
      validatePackDefinitionExports({connector, manifest: definition});
      validatePackDefinitionExports({pack, manifest: definition});
    }
  });

  it('ignores falsy modern exports when selecting the definition', () => {
    validatePackDefinitionExports({agent: false, connector: 0, pack: '', manifest: {}});
    validatePackDefinitionExports({agent: null, connector: false, pack});
    validatePackDefinitionExports({agent, connector: '', pack: 0});
    validatePackDefinitionExports({agent: false, connector, pack: null});
  });

  it('preserves metadata validation', async () => {
    const metadata = createFakePackVersionMetadata();
    const validated = await validatePackVersionMetadata(metadata, undefined);
    assert.equal(validated.version, metadata.version);
  });

  it('rejects more than one of agent, connector, and pack', () => {
    assert.throws(() => validatePackDefinitionExports({agent, connector}), /Found "agent" and "connector"/);
    assert.throws(() => validatePackDefinitionExports({pack, agent}), /Found "agent" and "pack"/);
    assert.throws(
      () => validatePackDefinitionExports({pack, agent, connector, manifest}),
      /Found "agent" and "connector" and "pack"/,
    );
  });

  it('requires an agent export to define an agent, and a connector export not to', () => {
    assert.throws(() => validatePackDefinitionExports({agent: {id: 1}}), /An agent export must define an agent/);
    assert.throws(
      () => validatePackDefinitionExports({connector: {agent: {tools: []}}}),
      /A connector export must not define an agent/,
    );
    assert.throws(() => validatePackDefinitionExports({agent: {agent: null}}), /An agent export must define an agent/);
  });

  for (const agentValue of [null, false, 0, 1, 'invalid', []]) {
    it(`rejects malformed agent fields (${JSON.stringify(agentValue)}) under modern export names`, () => {
      assert.throws(
        () => validatePackDefinitionExports({agent: {agent: agentValue}}),
        'An agent export must define an agent.',
      );
      assert.throws(
        () => validatePackDefinitionExports({connector: {agent: agentValue}}),
        'A connector export must not define an agent.',
      );
    });
  }

  it('accepts only object-valued agent fields for agents and absent or undefined fields for connectors', () => {
    validatePackDefinitionExports({agent: {agent: {}}});
    validatePackDefinitionExports({agent: newAgent()});
    validatePackDefinitionExports({connector: {}});
    validatePackDefinitionExports({connector: {agent: undefined}});
    validatePackDefinitionExports({connector: newConnector()});
    for (const definition of [{}, {agent: undefined}]) {
      assert.throws(() => validatePackDefinitionExports({agent: definition}), 'An agent export must define an agent.');
    }
  });

  it('rejects array and callable containers even with an object-valued agent field', () => {
    for (const definition of [Object.assign([], {agent: {}}), Object.assign(() => undefined, {agent: {}})]) {
      assert.throws(() => validatePackDefinitionExports({agent: definition}), 'An agent export must define an agent.');
      assert.throws(
        () => validatePackDefinitionExports({connector: definition}),
        'A connector export must not define an agent.',
      );
    }
  });

  it('reports malformed agent fields when duplicate exports are also present', () => {
    assert.throws(
      () => validatePackDefinitionExports({agent: {agent: null}, connector: {agent: false}}),
      /An agent export must define an agent/,
    );
  });

  it('leaves legacy agent fields and unrelated fields unread', () => {
    const definition = {
      get agent() {
        throw new Error('Legacy exports are kind-neutral.');
      },
    };
    validatePackDefinitionExports({pack: definition});
    validatePackDefinitionExports({manifest: definition});
    let reads = 0;
    validatePackDefinitionExports({
      agent: {
        get agent() {
          reads += 1;
          return {};
        },
        get unused() {
          throw new Error('Do not read unused fields.');
        },
      },
    });
    assert.equal(reads, 1);
  });

  it('leaves detailed object-valued agent validation to the metadata schema', async () => {
    const definition = {agent: {tools: 'invalid'}};
    validatePackDefinitionExports({agent: definition});
    await rejects(
      validatePackVersionMetadata({...createFakePackVersionMetadata(), agent: definition.agent}, undefined),
      PackMetadataValidationError,
    );
  });

  it('newConnector matches newPack, and newPack still builds a pack', () => {
    assert.instanceOf(newConnector(), PackDefinitionBuilder);
    assert.instanceOf(newPack(), PackDefinitionBuilder);
    assert.instanceOf(newAgent(), AgentDefinitionBuilder);
    assert.deepEqual(newConnector().formulas, newPack().formulas);
    assert.ok(newAgent().agent);
  });

  it('newConnector and newPack preserve an initial definition', () => {
    const definition = {version: '1.2.3', formulaNamespace: 'Example', networkDomains: ['example.com']};
    const connector = newConnector(definition);
    const pack = newPack(definition);
    assert.instanceOf(connector, PackDefinitionBuilder);
    assert.deepEqual(connector, pack);
    assert.equal(connector.version, '1.2.3');
    assert.equal(connector.formulaNamespace, 'Example');
    assert.deepEqual(connector.networkDomains, ['example.com']);
  });

  describe('legacy export validation', () => {
    const invalidDefinitions: Array<{label: string; value: unknown}> = [
      {label: 'number', value: 1},
      {label: 'boolean', value: true},
      {label: 'string', value: 'invalid'},
      {label: 'null', value: null},
      {label: 'undefined', value: undefined},
      {label: 'array', value: []},
      {label: 'array with metadata', value: Object.assign([], {version: '1.0.0'})},
      {label: 'function', value: () => undefined},
      {label: 'function with metadata', value: Object.assign(() => undefined, {version: '1.0.0'})},
    ];

    for (const exportName of ['pack', 'manifest']) {
      for (const {label, value} of invalidDefinitions) {
        it(`rejects a ${label} exported as ${exportName}`, () => {
          assert.throws(
            () => validatePackDefinitionExports({[exportName]: value}),
            'Invalid Pack definition export. Export a definition object as "agent", "connector", "pack", or "manifest".',
          );
        });
      }
    }

    it('rejects a missing definition export', () => {
      assert.throws(() => validatePackDefinitionExports({}), /Invalid Pack definition export\./);
    });
  });

  describe('importManifest', () => {
    async function withModule(source: string, body: (filename: string) => Promise<void>) {
      const directory = fs.mkdtempSync(path.join(__dirname, 'packs', '.tmp-pack-export-'));
      const filename = path.join(directory, 'pack.js');
      fs.writeFileSync(filename, source);
      try {
        await body(filename);
      } finally {
        fs.rmSync(directory, {recursive: true, force: true});
      }
    }

    const selectionCases = [
      {names: ['agent'], expected: 'agent'},
      {names: ['connector'], expected: 'connector'},
      {names: ['pack'], expected: 'pack'},
      {names: ['manifest'], expected: 'manifest'},
      {names: ['agent', 'connector', 'pack', 'manifest'], expected: 'agent'},
      {names: ['connector', 'pack', 'manifest'], expected: 'connector'},
      {names: ['pack', 'manifest'], expected: 'pack'},
    ];

    for (const {names, expected} of selectionCases) {
      it(`selects ${expected} from a module exporting ${names.join(', ')}`, async () => {
        const source = names.map(name => `exports.${name} = {name: '${name}'};`).join('\n');
        await withModule(source, async filename => {
          const module = await import(filename);
          assert.strictEqual(await importManifest(filename), module[expected]);
        });
      });
    }

    it('falls through an explicitly undefined pack export to manifest', async () => {
      await withModule('exports.pack = undefined; exports.manifest = {};', async filename => {
        const module = await import(filename);
        assert.strictEqual(await importManifest(filename), module.manifest);
      });
    });

    it('loads a primitive value without performing export validation', async () => {
      await withModule('exports.pack = 1;', async filename => {
        strictEqual(await importManifest(filename), 1);
      });
    });

    it('returns undefined for a module without a definition export', async () => {
      await withModule('exports.other = {};', async filename => {
        assert.isUndefined(await importManifest(filename));
      });
    });

    for (const exportName of ['pack', 'manifest']) {
      for (const factory of ['newPack', 'newConnector', 'newAgent']) {
        it(`preserves a ${factory} builder exported as ${exportName}`, async () => {
          await withModule(
            `exports.${exportName} = require('../../../builder').${factory}(); exports.${exportName}.setVersion('1.2.3');`,
            async filename => {
              const module = await import(filename);
              const loaded = await importManifest<PackVersionDefinition>(filename);
              assert.strictEqual(loaded, module[exportName]);
              assert.equal(loaded.version, '1.2.3');
              assert.isFunction(module[exportName].setVersion);
              validatePackDefinitionExports(module);
            },
          );
        });
      }

      it(`preserves a plain-object ${exportName} definition and ignores unrelated getters`, async () => {
        await withModule(
          `exports.${exportName} = {
            version: '1.2.3',
            formulas: [],
            get unused() { throw new Error('Do not read unused fields.'); },
          };`,
          async filename => {
            const module = await import(filename);
            const loaded = await importManifest<PackVersionDefinition>(filename);
            assert.strictEqual(loaded, module[exportName]);
            assert.equal(loaded.version, '1.2.3');
            assert.deepEqual(loaded.formulas, []);
          },
        );
      });
    }

    it('falls through falsy exports to a later object', async () => {
      await withModule(
        'exports.agent = false; exports.connector = 0; exports.pack = null; exports.manifest = {};',
        async filename => {
          const module = await import(filename);
          assert.strictEqual(await importManifest(filename), module.manifest);
        },
      );
    });

    it('selects a truthy earlier export without validating it', async () => {
      await withModule('exports.agent = 1; exports.pack = {};', async filename => {
        strictEqual(await importManifest(filename), 1);
      });
    });

    it('reads the selected export once and skips unused malformed fallbacks', async () => {
      await withModule(
        `Object.defineProperty(exports, '__esModule', {value: true});
        exports.reads = [];
        exports.definition = {version: '1.2.3'};
        Object.defineProperty(exports, 'agent', {get() { exports.reads.push('agent'); return exports.definition; }});
        Object.defineProperty(exports, 'connector', {get() { throw new Error('Unused fallback.'); }});
        exports.pack = 1;`,
        async filename => {
          const module = await import(filename);
          assert.strictEqual(await importManifest(filename), module.definition);
          assert.deepEqual(module.reads, ['agent']);
        },
      );
    });
  });

  describe('compiled bundles', () => {
    async function withPackSource(
      source: string,
      minify: boolean,
      body: (bundlePath: string) => Promise<void>,
      validateExports?: boolean,
    ) {
      const directory = fs.mkdtempSync(path.join(__dirname, 'packs', '.tmp-pack-export-'));
      const manifestPath = path.join(directory, 'pack.ts');
      fs.writeFileSync(manifestPath, source);
      try {
        const compiled = await packCompiler.compilePackBundle({
          manifestPath,
          minify,
          intermediateOutputDirectory: directory,
          validateExports,
        });
        await body(compiled.bundlePath);
      } finally {
        fs.rmSync(directory, {recursive: true, force: true});
      }
    }

    function formulaPack(exportName: 'pack' | 'agent' | 'connector' | 'manifest', factory: string): string {
      return `import * as sdk from '../../../index';

export const ${exportName} = sdk.${factory}();

${exportName}.addFormula({
  name: 'Double',
  description: 'Doubles a number.',
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.Number,
      name: 'value',
      description: 'Value to double.',
    }),
  ],
  resultType: sdk.ValueType.Number,
  execute: async ([value]) => value * 2,
});
`;
    }

    async function assertDoubled(bundlePath: string) {
      const loaded = await importManifest(bundlePath);
      assert.equal(loaded.formulas?.[0]?.name, 'Double');
      const result = await executeFormulaOrSyncWithVM({
        formulaName: 'Double',
        params: [5],
        bundlePath,
      });
      assert.equal(result, 10);
    }

    async function assertExportError(bundlePath: string, pattern: RegExp) {
      const packModule = await import(path.resolve(bundlePath));
      assert.throws(() => validatePackDefinitionExports(packModule), pattern);
    }

    const selectionCases = [
      {names: ['agent', 'connector', 'pack', 'manifest'], expected: 'agent'},
      {names: ['connector', 'pack', 'manifest'], expected: 'connector'},
      {names: ['pack', 'manifest'], expected: 'pack'},
      {names: ['manifest'], expected: 'manifest'},
    ];

    for (const {names, expected} of selectionCases) {
      it(`selects ${expected} in the CLI and formula runtime from ${names.join(', ')}`, async function () {
        this.timeout(60000);
        const source = `import * as sdk from '../../../index';
${names
  .map(
    name => `export const ${name} = sdk.newPack();
${name}.addFormula({
  name: 'SelectedExport',
  description: 'Returns the selected export name.',
  parameters: [],
  resultType: sdk.ValueType.String,
  execute: async () => '${name}',
});`,
  )
  .join('\n')}
`;
        await withPackSource(source, false, async bundlePath => {
          const module = await import(path.resolve(bundlePath));
          assert.strictEqual(await importManifest(bundlePath), module[expected]);
          const result = await executeFormulaOrSyncWithVM({
            formulaName: 'SelectedExport',
            params: [],
            bundlePath,
          });
          assert.equal(result, expected);
        });
      });
    }

    for (const validateExports of [undefined, false]) {
      it(`compiles a primitive export with validateExports=${validateExports}`, async function () {
        this.timeout(60000);
        await withPackSource(
          'export const pack = 1;',
          false,
          async bundlePath => {
            strictEqual(await importManifest(bundlePath), 1);
            await assertExportError(bundlePath, /Invalid Pack definition export\./);
          },
          validateExports,
        );
      });
    }

    it('rejects missing exports before compiling metadata when validation is enabled', async () => {
      await rejects(
        withPackSource('export const other = {};', false, async () => assert.fail('Compilation must reject.'), true),
        {
          message:
            'Invalid Pack definition export. Export a definition object as "agent", "connector", "pack", or "manifest".',
        },
      );
    });

    it('compiles valid exports when validation is enabled', async () => {
      await withPackSource(
        'export const pack = {version: "1.2.3"};',
        true,
        async bundlePath => {
          assert.equal((await importManifest<PackVersionDefinition>(bundlePath)).version, '1.2.3');
        },
        true,
      );
    });

    for (const exportName of ['pack', 'manifest']) {
      it(`preserves a cross-bundle agent builder exported as ${exportName}`, async function () {
        this.timeout(60000);
        const source = `import * as sdk from '../../../index';
export const ${exportName} = sdk.newAgent();
${exportName}.setVersion('1.2.3');
${exportName}.setInstructions('Hi.');
`;
        await withPackSource(source, false, async bundlePath => {
          const module = await import(path.resolve(bundlePath));
          const loaded = await importManifest<PackVersionDefinition>(bundlePath);
          assert.strictEqual(loaded, module[exportName]);
          assert.notInstanceOf(loaded, AgentDefinitionBuilder);
          assert.equal(loaded.version, '1.2.3');
          assert.isFunction(module[exportName].setInstructions);
          assert.ok(loaded.agent);
          validatePackDefinitionExports(module);
        });
      });
    }

    it('loads an agent export built with newAgent', async function () {
      this.timeout(60000);
      const source = `import * as sdk from '../../../index';
export const agent = sdk.newAgent();
agent.setInstructions('Hi.');
`;
      await withPackSource(source, false, async bundlePath => {
        const loaded = await importManifest(bundlePath);
        assert.ok(loaded.agent);
        const packModule = await import(path.resolve(bundlePath));
        validatePackDefinitionExports(packModule);
      });
    });

    it('executes a minified bundle that exports a connector from newConnector', async function () {
      this.timeout(60000);
      await withPackSource(formulaPack('connector', 'newConnector'), true, async bundlePath => {
        await assertDoubled(bundlePath);
        const packModule = await import(path.resolve(bundlePath));
        validatePackDefinitionExports(packModule);
      });
    });

    it('still loads a legacy manifest export', async function () {
      this.timeout(60000);
      await withPackSource(formulaPack('manifest', 'newPack'), false, async bundlePath => {
        const loaded = await importManifest(bundlePath);
        assert.equal(loaded.formulas?.[0]?.name, 'Double');
        const packModule = await import(path.resolve(bundlePath));
        validatePackDefinitionExports(packModule);
      });
    });

    it('loads the agent when agent and connector are both exported, and validation rejects that', async function () {
      this.timeout(60000);
      const source = `import * as sdk from '../../../index';
export const agent = sdk.newAgent();
agent.setVersion('1.0.0');
export const connector = sdk.newConnector();
connector.setVersion('2.0.0');
`;
      await withPackSource(source, false, async bundlePath => {
        const loaded = await importManifest<PackVersionDefinition>(bundlePath);
        assert.equal(loaded.version, '1.0.0');
        await assertExportError(bundlePath, /Found "agent" and "connector"/);
      });
    });

    it('still runs a connector that defines an agent, and validation rejects that', async function () {
      this.timeout(60000);
      const source = `${formulaPack('connector', 'newConnector')}
connector.agent = {tools: []};
`;
      await withPackSource(source, false, async bundlePath => {
        await assertDoubled(bundlePath);
        await assertExportError(bundlePath, /A connector export must not define an agent/);
      });
    });

    it('still runs an agent export with no agent, and validation rejects that', async function () {
      this.timeout(60000);
      await withPackSource(formulaPack('agent', 'newPack'), false, async bundlePath => {
        await assertDoubled(bundlePath);
        await assertExportError(bundlePath, /An agent export must define an agent/);
      });
    });
  });
});
