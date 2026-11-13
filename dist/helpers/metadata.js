"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileMetadataFormulaMetadata = exports.compileSyncTable = exports.compileFormulaMetadata = exports.compileFormulasMetadata = exports.normalizePackMetadataIdentities = exports.compilePackMetadata = void 0;
const types_1 = require("../types");
const api_1 = require("../api");
const schema_1 = require("../schema");
function compilePackMetadata(manifest) {
    const { formats, formulas, formulaNamespace, syncTables, defaultAuthentication, skills, ...definition } = manifest;
    const compiledFormats = compileFormatsMetadata(formats || []);
    const compiledFormulas = (formulas && compileFormulasMetadata(formulas)) || [];
    // Note: we do not need to compile systemConnectionAuthentication metadata because it doesn't contain formulas,
    // so we can pass it through directly as metadata.
    const defaultAuthenticationMetadata = compileDefaultAuthenticationMetadata(defaultAuthentication);
    const metadata = {
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
exports.compilePackMetadata = compilePackMetadata;
function normalizePackMetadataIdentities(metadata) {
    return {
        ...metadata,
        ...(metadata.formulas && {
            formulas: Array.isArray(metadata.formulas)
                ? metadata.formulas.map(withNormalizedSchema)
                : Object.fromEntries(Object.entries(metadata.formulas).map(([namespace, formulas]) => [
                    namespace,
                    formulas.map(withNormalizedSchema),
                ])),
        }),
        ...(metadata.syncTables && {
            syncTables: metadata.syncTables.map(table => ({
                ...withNormalizedSchema(table),
                getter: withNormalizedSchema(table.getter),
                ...(table.namedPropertyOptions && {
                    namedPropertyOptions: Object.fromEntries(Object.entries(table.namedPropertyOptions).map(([name, formula]) => [name, withNormalizedSchema(formula)])),
                }),
                ...(table.getSchema && { getSchema: withNormalizedSchema(table.getSchema) }),
            })),
        }),
    };
}
exports.normalizePackMetadataIdentities = normalizePackMetadataIdentities;
function withNormalizedSchema(value) {
    return { ...value, ...(value.schema && { schema: (0, schema_1.normalizeSchemaIdentities)(value.schema) }) };
}
function compileFormatsMetadata(formats) {
    return formats.map(format => {
        return {
            ...format,
            matchers: (format.matchers || []).map(matcher => matcher.toString()),
        };
    });
}
function compileFormulasMetadata(formulas) {
    return formulas.map(compileFormulaMetadata);
}
exports.compileFormulasMetadata = compileFormulasMetadata;
function compileFormulaMetadata(formula) {
    const { execute, validateParameters, ...rest } = formula;
    return {
        ...rest,
        validateParameters: compileMetadataFormulaMetadata(validateParameters),
    };
}
exports.compileFormulaMetadata = compileFormulaMetadata;
function compileSyncTable(syncTable) {
    if ((0, api_1.isDynamicSyncTable)(syncTable)) {
        const { getter, getName, getSchema, getDisplayUrl, listDynamicUrls, searchDynamicUrls, ...rest } = syncTable;
        const { execute, executeUpdate, executeGetPermissions, validateParameters, ...getterRest } = getter;
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
    const { getter, ...rest } = syncTable;
    const { execute, executeUpdate, executeGetPermissions, validateParameters, ...getterRest } = getter;
    return {
        ...rest,
        getter: {
            supportsUpdates: Boolean(executeUpdate),
            supportsGetPermissions: Boolean(executeGetPermissions),
            validateParameters: compileMetadataFormulaMetadata(validateParameters),
            ...getterRest,
        },
    };
}
exports.compileSyncTable = compileSyncTable;
function compileDefaultAuthenticationMetadata(authentication) {
    if (!authentication) {
        return;
    }
    if (authentication.type === types_1.AuthenticationType.None || authentication.type === types_1.AuthenticationType.Various) {
        return authentication;
    }
    const { getConnectionName, getConnectionUserId, postSetup, ...rest } = authentication;
    return {
        ...rest,
        getConnectionName: compileMetadataFormulaMetadata(getConnectionName),
        getConnectionUserId: compileMetadataFormulaMetadata(getConnectionUserId),
        postSetup: postSetup ? postSetup.map(compilePostSetupStepMetadata) : undefined,
    };
}
function compileMetadataFormulaMetadata(formula) {
    if (!formula) {
        return;
    }
    const { execute, validateParameters, ...rest } = formula;
    return rest;
}
exports.compileMetadataFormulaMetadata = compileMetadataFormulaMetadata;
function compilePostSetupStepMetadata(step) {
    const { getOptions, getOptionsFormula, ...rest } = step;
    return {
        ...rest,
        getOptions: step.getOptions ? compileMetadataFormulaMetadata(step.getOptions) : undefined,
        getOptionsFormula: step.getOptionsFormula ? compileMetadataFormulaMetadata(step.getOptionsFormula) : undefined,
    };
}
