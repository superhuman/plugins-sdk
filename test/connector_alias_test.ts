import {testHelper} from './test_helper';
import {isObjectFormula} from '../api';
import {isObjectPackFormula} from '../api';
import {isStringFormula} from '../api';
import {isStringPackFormula} from '../api';
import {isSyncFormula} from '../api';
import {isSyncPackFormula} from '../api';

// [declaring file, legacy name, canonical name, type arguments]
const aliases = [
  ['types', 'BasicPackDefinition', 'BasicComponentDefinition', ''],
  ['types', 'PackVersionDefinition', 'ComponentVersionDefinition', ''],
  ['types', 'PackTool', 'ConnectorTool', ''],
  ['compiled_types', 'PackMetadata', 'ComponentMetadata', ''],
  ['compiled_types', 'PackVersionMetadata', 'ComponentVersionMetadata', ''],
  ['compiled_types', 'ExternalPackMetadata', 'ExternalComponentMetadata', ''],
  ['compiled_types', 'ExternalPackVersionMetadata', 'ExternalComponentVersionMetadata', ''],
  ['compiled_types', 'PackFormatMetadata', 'FormatMetadata', ''],
  ['compiled_types', 'PackSyncTable', 'SyncTableMetadata', ''],
  ['compiled_types', 'ExternalPackFormat', 'ExternalFormat', ''],
  ['compiled_types', 'ExternalPackFormatMetadata', 'ExternalFormatMetadata', ''],
  ['compiled_types', 'ExternalObjectPackFormula', 'ExternalObjectFormula', ''],
  ['compiled_types', 'ExternalPackFormula', 'ExternalFormula', ''],
  ['compiled_types', 'ExternalPackFormulas', 'ExternalFormulas', ''],
  ['compiled_types', 'PackUpload', 'ComponentUpload', ''],
  ['compiled_types', 'PackResource', 'Resource', ''],
  ['compiled_types', 'PackResourceArtifact', 'ResourceArtifact', ''],
  ['api', 'PackFormulaDef', 'FormulaDef', '<[], string>'],
  ['api', 'PackFormulaMetadata', 'FormulaMetadata', ''],
  ['api', 'TypedPackFormula', 'TypedFormula', ''],
  ['api', 'BooleanPackFormula', 'BooleanFormula', '<[]>'],
  ['api', 'NumericPackFormula', 'NumericFormula', '<[]>'],
  ['api', 'ObjectPackFormula', 'ObjectFormula', '<[], SDK.StringSchema>'],
  ['api', 'StringPackFormula', 'StringFormula', '<[]>'],
  ['api', 'PackFormulaUi', 'FormulaUi', ''],
  ['api_types', 'CommonPackFormulaDef', 'CommonFormulaDef', '<[]>'],
  ['api_types', 'PackFormulaValue', 'FormulaValue', ''],
  ['api_types', 'PackFormulaResult', 'FormulaResult', ''],
] as const;

// Interface pairs where the legacy interface extends the canonical one.
const interfaces = [
  ['types', 'PackVersionDefinition', 'ComponentVersionDefinition', '', ''],
  ['types', 'PackTool', 'ConnectorTool', '', ''],
  ['compiled_types', 'PackFormatMetadata', 'FormatMetadata', '', ''],
  ['compiled_types', 'ExternalPackVersionMetadata', 'ExternalComponentVersionMetadata', '', ''],
  ['api', 'PackFormulaDef', 'FormulaDef', '<ParamsT, ResultT, ContextT>', '<[], string>'],
  ['api', 'PackFormulaUi', 'FormulaUi', '', ''],
  ['api_types', 'CommonPackFormulaDef', 'CommonFormulaDef', '<T>', '<[]>'],
] as const;

// CommonPackFormulaDef gains a required field below, so canonical values no longer satisfy it.
const oneWay = new Set(['CommonPackFormulaDef', 'PackFormulaDef']);

// Augments the legacy interfaces the way a consumer's .d.ts file would. `owner` maps a declaring
// file to the module specifier that declares it for this entry point.
function augment(owner: (file: string) => string, sdk: string) {
  const byOwner = new Map<string, string[]>();
  const add = (file: string, declaration: string) =>
    byOwner.set(owner(file), [...(byOwner.get(owner(file)) ?? []), declaration]);
  add('builder', 'interface PackDefinitionBuilder { builderMarker?: string }');
  add('types', 'interface PackVersionDefinition { versionMarker?: string; name?: string; id?: number }');
  add('types', 'interface PackDefinition { definitionMarker?: number }');
  add('types', 'interface PackTool { toolMarker?: string }');
  add('types', 'interface PackKnowledgeToolSource { knowledgeMarker?: number }');
  add('compiled_types', 'interface PackFormatMetadata { formatMarker?: string }');
  add('compiled_types', 'interface ExternalPackVersionMetadata { externalMarker?: number }');
  add('api', 'interface PackFormulaUi { uiMarker?: string }');
  add(
    'api',
    `interface PackFormulaDef<ParamsT, ResultT, ContextT> {
      formulaMarker?: string;
      execute(params: ${sdk}.ParamValues<ParamsT>, context: ContextT): ResultT | Promise<ResultT> | undefined;
    }`,
  );
  add('api_types', 'interface CommonPackFormulaDef<T> { commonMarker: number }');
  for (const [file, , newName, parameters] of interfaces) {
    add(file, `interface ${newName}${parameters} { ${newName}Marker?: number }`);
  }
  return [...byOwner].map(([module, body]) => `declare module '${module}' {\n${body.join('\n')}\n}`).join('\n');
}

// Exercises every legacy extension point through one entry point. `p` keeps names unique per entry.
function exercise(p: string, SDK: string) {
  const pairs = aliases
    .map(([, oldName, newName, args]) => {
      const a = args.replace('SDK.', `${SDK}.`);
      return `
        declare let ${p}old${oldName}: ${SDK}.${oldName}${a};
        declare let ${p}new${newName}: ${SDK}.${newName}${a};
        ${p}new${newName} = ${p}old${oldName};
        ${oneWay.has(oldName) ? '' : `${p}old${oldName} = ${p}new${newName};`}`;
    })
    .join('');
  const inheritance = interfaces
    .map(([, oldName, newName, , args]) => {
      const legacyMarker = {
        PackVersionDefinition: 'versionMarker',
        PackTool: 'toolMarker',
        PackFormatMetadata: 'formatMarker',
        ExternalPackVersionMetadata: 'externalMarker',
        PackFormulaDef: 'formulaMarker',
        PackFormulaUi: 'uiMarker',
        CommonPackFormulaDef: 'commonMarker',
      }[oldName];
      return `
        declare const ${p}i${oldName}: ${SDK}.${oldName}${args};
        declare const ${p}i${newName}: ${SDK}.${newName}${args};
        const ${p}i${oldName}Inherited: number | undefined = ${p}i${oldName}.${newName}Marker;
        // @ts-expect-error A legacy augmentation does not reach the canonical interface.
        ${p}i${newName}.${legacyMarker};`;
    })
    .join('');
  return `
    ${pairs}
    ${inheritance}

    for (const builder of [
      new ${SDK}.PackDefinitionBuilder({versionMarker: 'constructor'}),
      ${SDK}.newConnector({versionMarker: 'connector'}),
      ${SDK}.newPack({versionMarker: 'pack'}),
    ]) {
      const marker: string | undefined = builder.setVersion('1.2.3').builderMarker;
    }
    // @ts-expect-error A legacy class augmentation does not reach the canonical class.
    new ${SDK}.ConnectorDefinitionBuilder().builderMarker;
    const ${p}oldBuilder: ${SDK}.PackDefinitionBuilder = new ${SDK}.ConnectorDefinitionBuilder();
    const ${p}newConstructor: typeof ${SDK}.ConnectorDefinitionBuilder = ${SDK}.PackDefinitionBuilder;
    class ${p}CustomBuilder extends ${SDK}.ConnectorDefinitionBuilder {}
    const ${p}extended: ${SDK}.PackDefinitionBuilder = new ${p}CustomBuilder();

    declare const ${p}definition: ${SDK}.PackDefinition;
    const ${p}name: string = ${p}definition.name;
    const ${p}id: number = ${p}definition.id;
    const ${p}own: number | undefined = ${p}definition.definitionMarker;
    declare const ${p}basic: ${SDK}.BasicPackDefinition;
    declare const ${p}versionMetadata: ${SDK}.PackVersionMetadata;
    declare const ${p}metadata: ${SDK}.PackMetadata;
    declare const ${p}externalVersion: ${SDK}.ExternalPackVersionMetadata;
    declare const ${p}external: ${SDK}.ExternalPackMetadata;
    const ${p}versionMarkers: Array<string | undefined> = [
      ${p}definition.versionMarker, ${p}basic.versionMarker, ${p}versionMetadata.versionMarker,
      ${p}metadata.versionMarker, ${p}externalVersion.versionMarker, ${p}external.versionMarker,
    ];

    const ${p}formulas = [
      ${SDK}.makeFormula({name: 'N', description: '', parameters: [], resultType: ${SDK}.ValueType.Number,
        formulaMarker: 'n', commonMarker: 1, execute: () => 1}),
      ${SDK}.makeFormula({name: 'T', description: '', parameters: [], resultType: ${SDK}.ValueType.String,
        formulaMarker: 't', commonMarker: 1, execute: () => 'text'}),
      ${SDK}.makeFormula({name: 'B', description: '', parameters: [], resultType: ${SDK}.ValueType.Boolean,
        formulaMarker: 'b', commonMarker: 1, execute: () => true}),
      ${SDK}.makeFormula({name: 'O', description: '', parameters: [], resultType: ${SDK}.ValueType.Object,
        schema: {type: ${SDK}.ValueType.Object, properties: {}}, formulaMarker: 'o', commonMarker: 1, execute: () => ({})}),
      ${SDK}.makeFormula({name: 'A', description: '', parameters: [], resultType: ${SDK}.ValueType.Array,
        items: {type: ${SDK}.ValueType.String}, formulaMarker: 'a', commonMarker: 1, execute: () => []}),
    ];
    for (const formula of ${p}formulas) {
      const inherited: string | undefined = formula.formulaMarker;
      const common: number = formula.commonMarker;
    }
    const ${p}table = ${SDK}.makeSyncTable({name: 'Rows', identityName: 'Row',
      schema: {type: ${SDK}.ValueType.Object, idProperty: 'id', displayProperty: 'name', properties: {
        id: {type: ${SDK}.ValueType.String}, name: {type: ${SDK}.ValueType.String},
      }},
      formula: {name: 'Sync', description: '', parameters: [], commonMarker: 1, execute: async () => ({result: []})},
    });
    const ${p}tableCommon: number = ${p}table.getter.commonMarker;
    type ${p}Sync = ${SDK}.SyncFormulaDef<'id', 'name', [], ${SDK}.ObjectSchemaDefinition<'id', 'name'>, ${SDK}.SyncExecutionContext, {}>;
    declare const ${p}sync: ${p}Sync;
    const ${p}syncCommon: number = ${p}sync.commonMarker;
    declare const ${p}options: ${SDK}.FormulaOptions<[], ${SDK}.PackFormulaDef<[], string>>;
    declare const ${p}definitionOptions: ${SDK}.FormulaDefinitionOptions<[], ${SDK}.ValueType.Number, ${SDK}.Schema>;
    declare const ${p}base: ${SDK}.BaseFormulaDef<[], number>;
    declare const ${p}empty: ${SDK}.EmptyFormulaDef<[]>;
    declare const ${p}objects: ${SDK}.ObjectArrayFormulaDef<[], ${SDK}.StringSchema>;
    const ${p}formulaMarkers: Array<string | undefined> = [
      ${p}options.formulaMarker, ${p}definitionOptions.formulaMarker, ${p}base.formulaMarker,
      ${p}empty.formulaMarker, ${p}objects.formulaMarker,
    ];
    const ${p}commonMarkers: number[] = [${p}options.commonMarker, ${p}definitionOptions.commonMarker];
    declare const ${p}params: ${SDK}.ParamValues<[]>;
    declare const ${p}context: ${SDK}.ExecutionContext;
    const ${p}overload: string | Promise<string> | undefined = ${p}oldPackFormulaDef.execute(${p}params, ${p}context);

    declare const ${p}tool: ${SDK}.Tool;
    if (${p}tool.type === ${SDK}.ToolType.Pack) {
      const marker: string | undefined = ${p}tool.toolMarker;
    }
    declare const ${p}agentTool: NonNullable<${SDK}.PackVersionDefinition['agent']>['tools'][number];
    if (${p}agentTool.type === ${SDK}.ToolType.Pack) {
      const marker: string | undefined = ${p}agentTool.toolMarker;
    }
    declare const ${p}knowledge: ${SDK}.KnowledgeTool;
    if (${p}knowledge.source.type === ${SDK}.KnowledgeToolSourceType.Pack) {
      const marker: number | undefined = ${p}knowledge.source.knowledgeMarker;
    }
    const ${p}format: string | undefined = ${p}versionMetadata.formats[0].formatMarker;
    const ${p}externalMarker: number | undefined = ${p}external.externalMarker;
    declare const ${p}externalFormat: ${SDK}.ExternalPackFormatMetadata;
    const ${p}externalFormatMarker: string | undefined = ${p}externalFormat.formatMarker;
    declare const ${p}formulaMetadata: ${SDK}.PackFormulaMetadata;
    const ${p}uiMarker: string | undefined = ${p}formulaMetadata.ui?.uiMarker;

    // @ts-expect-error Parameters must be parameter definitions.
    type ${p}BadParams = ${SDK}.FormulaDef<string, string>;
    // @ts-expect-error Undefined is not a formula result.
    type ${p}BadResult = ${SDK}.FormulaDef<[], undefined>;
    // @ts-expect-error Context must satisfy ExecutionContext.
    type ${p}BadContext = ${SDK}.FormulaDef<[], string, {}>;
    // @ts-expect-error ObjectFormula requires a schema.
    type ${p}MissingSchema = ${SDK}.ObjectFormula<[]>;
    const ${p}recursiveValue: ${SDK}.FormulaValue = ['text', [1, true, new Date()]];
    const ${p}recursiveResult: ${SDK}.FormulaResult = [{field: 'value'}, [${p}recursiveValue]];
  `;
}

// Deep imports must export every canonical name from the file that declares it.
function deepImports() {
  const byFile = new Map<string, string[]>([['builder', ['ConnectorDefinitionBuilder']]]);
  for (const [file, , newName] of aliases) {
    byFile.set(file, [...(byFile.get(file) ?? []), newName]);
  }
  return [...byFile].map(([file, names]) => `import type {${names.join(', ')}} from '../dist/${file}';`).join('\n');
}

describe('published connector aliases', () => {
  it('keeps legacy names and extension points working at root, deep, and bundle imports', () => {
    testHelper.checkConsumer(`
      import * as Root from '../dist';
      import * as Bundle from '../dist/bundle';
      ${deepImports()}
      ${augment(file => `../dist/${file}`, 'Root')}
      ${augment(() => '../dist/bundle', 'Bundle')}
      ${exercise('r', 'Root')}
      ${exercise('b', 'Bundle')}
    `);
  });

  it('keeps legacy formula guards as the canonical functions', () => {
    assert.strictEqual(isObjectPackFormula, isObjectFormula);
    assert.strictEqual(isStringPackFormula, isStringFormula);
    assert.strictEqual(isSyncPackFormula, isSyncFormula);
  });
});
