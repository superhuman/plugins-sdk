import type {Authentication} from '../types';
import type {AuthenticationMetadata} from '../compiled_types';
import {AuthenticationType} from '../types';
import type {ExecutionContext} from '../api';
import type {ExternalPackMetadata} from '../compiled_types';
import type {ExternalPackVersionMetadata} from '../compiled_types';
import type {Format} from '../types';
import type {Formula} from '../api';
import type {GenericSyncTable} from '../api';
import type {LegacyDefaultMetadataReturnType} from '../api';
import type {MetadataFormula} from '../api';
import type {MetadataFormulaMetadata} from '../api';
import type {PackDefinition} from '../types';
import type {PackFormatMetadata} from '../compiled_types';
import type {PackFormulaMetadata} from '../api';
import type {PackFormulaResult} from '../api_types';
import type {PackMetadata} from '../compiled_types';
import type {PackSyncTable} from '../compiled_types';
import type {PackVersionDefinition} from '../types';
import type {PackVersionMetadata} from '../compiled_types';
import type {ParameterValidationResult} from '../api';
import type {PostSetup} from '../types';
import type {PostSetupMetadata} from '../compiled_types';
import type {Schema} from '../schema';
import type {TypedPackFormula} from '../api';
import {isDynamicSyncTable} from '../api';
import {normalizeSchemaIdentities} from '../schema';

// Legacy metadata compilation kept around until we migrate first-party packs.
export function compilePackMetadata(manifest: PackDefinition): PackMetadata;
export function compilePackMetadata(manifest: PackVersionDefinition): PackVersionMetadata;
export function compilePackMetadata(manifest: PackVersionDefinition): PackVersionMetadata {
  const {formats, formulas, formulaNamespace, syncTables, defaultAuthentication, skills, ...definition} = manifest;
  const compiledFormats = compileFormatsMetadata(formats || []);
  const compiledFormulas = (formulas && compileFormulasMetadata(formulas)) || [];
  // Note: we do not need to compile systemConnectionAuthentication metadata because it doesn't contain formulas,
  // so we can pass it through directly as metadata.
  const defaultAuthenticationMetadata = compileDefaultAuthenticationMetadata(defaultAuthentication);
  const metadata: PackVersionMetadata = {
    ...definition,
    defaultAuthentication: defaultAuthenticationMetadata,
    formulaNamespace,
    formats: compiledFormats,
    formulas: compiledFormulas,
    syncTables: (syncTables || []).map(compileSyncTable),
    // Skills can be passed through as they are pure JSON.
    skills,
  };

  return normalizePackMetadataIdentities(metadata);
}

interface MetadataWithSchemas {
  formulas?: PackFormulaMetadata[] | Record<string, PackFormulaMetadata[]>;
  syncTables?: PackSyncTable[];
}

/** @internal Hydrate schema identity aliases in compiled or historically stored metadata. */
export function normalizePackMetadataIdentities(metadata: PackMetadata): PackMetadata;
export function normalizePackMetadataIdentities(metadata: PackVersionMetadata): PackVersionMetadata;
export function normalizePackMetadataIdentities(metadata: ExternalPackMetadata): ExternalPackMetadata;
export function normalizePackMetadataIdentities(metadata: ExternalPackVersionMetadata): ExternalPackVersionMetadata;
export function normalizePackMetadataIdentities(metadata: MetadataWithSchemas): MetadataWithSchemas {
  return {
    ...metadata,
    ...(metadata.formulas && {
      formulas: Array.isArray(metadata.formulas)
        ? metadata.formulas.map(withNormalizedSchema)
        : Object.fromEntries(
            Object.entries(metadata.formulas).map(([namespace, formulas]) => [
              namespace,
              formulas.map(withNormalizedSchema),
            ]),
          ),
    }),
    ...(metadata.syncTables && {
      syncTables: metadata.syncTables.map(table => ({
        ...withNormalizedSchema(table),
        getter: withNormalizedSchema(table.getter),
        ...(table.namedPropertyOptions && {
          namedPropertyOptions: Object.fromEntries(
            Object.entries(table.namedPropertyOptions).map(([name, formula]) => [name, withNormalizedSchema(formula)]),
          ),
        }),
        ...(table.getSchema && {getSchema: withNormalizedSchema(table.getSchema)}),
      })),
    }),
  };
}

function withNormalizedSchema<T extends {schema?: Schema}>(value: T): T {
  return {...value, ...(value.schema && {schema: normalizeSchemaIdentities(value.schema)})};
}

function compileFormatsMetadata(formats: Format[]): PackFormatMetadata[] {
  return formats.map(format => {
    return {
      ...format,
      matchers: (format.matchers || []).map(matcher => matcher.toString()),
    };
  });
}

export function compileFormulasMetadata(formulas: Formula[]): PackFormulaMetadata[] {
  return formulas.map(compileFormulaMetadata);
}

export function compileFormulaMetadata(formula: TypedPackFormula): PackFormulaMetadata {
  const {execute, validateParameters, ...rest} = formula;
  return {
    ...rest,
    validateParameters: compileMetadataFormulaMetadata<ExecutionContext, ParameterValidationResult>(validateParameters),
  };
}

export function compileSyncTable(syncTable: GenericSyncTable): PackSyncTable {
  if (isDynamicSyncTable(syncTable)) {
    const {getter, getName, getSchema, getDisplayUrl, listDynamicUrls, searchDynamicUrls, ...rest} = syncTable;
    const {execute, executeUpdate, executeGetPermissions, validateParameters, ...getterRest} = getter;
    return {
      ...rest,
      getName: compileMetadataFormulaMetadata(getName),
      getSchema: compileMetadataFormulaMetadata(getSchema),
      getDisplayUrl: compileMetadataFormulaMetadata(getDisplayUrl),
      listDynamicUrls: compileMetadataFormulaMetadata(listDynamicUrls),
      searchDynamicUrls: compileMetadataFormulaMetadata(searchDynamicUrls),
      getter: {
        supportsUpdates: Boolean(executeUpdate),
        supportsGetPermissions: Boolean(executeGetPermissions),
        validateParameters: compileMetadataFormulaMetadata(validateParameters),
        ...getterRest,
      },
    };
  }

  const {getter, ...rest} = syncTable;
  const {execute, executeUpdate, executeGetPermissions, validateParameters, ...getterRest} = getter;
  return {
    ...rest,
    getter: {
      supportsUpdates: Boolean(executeUpdate),
      supportsGetPermissions: Boolean(executeGetPermissions),
      validateParameters: compileMetadataFormulaMetadata<ExecutionContext, ParameterValidationResult>(
        validateParameters,
      ),
      ...getterRest,
    },
  };
}

function compileDefaultAuthenticationMetadata(
  authentication: Authentication | undefined,
): AuthenticationMetadata | undefined {
  if (!authentication) {
    return;
  }
  if (authentication.type === AuthenticationType.None || authentication.type === AuthenticationType.Various) {
    return authentication;
  }
  const {getConnectionName, getConnectionUserId, postSetup, ...rest} = authentication;
  return {
    ...rest,
    getConnectionName: compileMetadataFormulaMetadata(getConnectionName),
    getConnectionUserId: compileMetadataFormulaMetadata(getConnectionUserId),
    postSetup: postSetup ? postSetup.map(compilePostSetupStepMetadata) : undefined,
  };
}

export function compileMetadataFormulaMetadata<
  ContextT extends ExecutionContext = ExecutionContext,
  ResultT extends PackFormulaResult = LegacyDefaultMetadataReturnType,
>(formula: MetadataFormula<ContextT, ResultT> | undefined): MetadataFormulaMetadata<ContextT, ResultT> | undefined {
  if (!formula) {
    return;
  }
  const {execute, validateParameters, ...rest} = formula;
  return rest;
}

function compilePostSetupStepMetadata(step: PostSetup): PostSetupMetadata {
  const {getOptions, getOptionsFormula, ...rest} = step;
  return {
    ...rest,
    getOptions: step.getOptions ? compileMetadataFormulaMetadata(step.getOptions) : undefined,
    getOptionsFormula: step.getOptionsFormula ? compileMetadataFormulaMetadata(step.getOptionsFormula) : undefined,
  };
}
