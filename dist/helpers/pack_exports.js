"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePackDefinitionExports = exports.PackDefinitionExportValidationError = void 0;
const zod_1 = require("zod");
var PackDefinitionExportName;
(function (PackDefinitionExportName) {
    PackDefinitionExportName["Agent"] = "agent";
    PackDefinitionExportName["Connector"] = "connector";
    PackDefinitionExportName["Pack"] = "pack";
    PackDefinitionExportName["Manifest"] = "manifest";
})(PackDefinitionExportName || (PackDefinitionExportName = {}));
const PackDefinitionExportNames = [
    PackDefinitionExportName.Agent,
    PackDefinitionExportName.Connector,
    PackDefinitionExportName.Pack,
];
const InvalidDefinitionExport = 'Invalid Pack definition export. Export a definition object as "agent", "connector", "pack", or "manifest".';
const DefinitionExport = zod_1.z.object({});
const AgentExport = zod_1.z.object({ agent: DefinitionExport });
const ConnectorExport = zod_1.z.object({ agent: zod_1.z.never().optional() });
const PackDefinitionExportModuleSchema = zod_1.z
    .object({
    agent: zod_1.z
        .unknown()
        .optional()
        .refine(value => !value || AgentExport.safeParse(value).success, {
        message: 'An agent export must define an agent.',
    }),
    connector: zod_1.z
        .unknown()
        .optional()
        .refine(value => !value || ConnectorExport.safeParse(value).success, {
        message: 'A connector export must not define an agent.',
    }),
    pack: zod_1.z
        .unknown()
        .optional()
        .refine(value => !value || DefinitionExport.safeParse(value).success, {
        message: InvalidDefinitionExport,
    }),
    manifest: zod_1.z.unknown().optional(),
})
    .superRefine((moduleExports, context) => {
    const fail = (message) => context.addIssue({ code: 'custom', message });
    const names = PackDefinitionExportNames.filter(name => moduleExports[name]);
    if (names.length > 1) {
        const listed = names.map(name => `"${name}"`).join(' and ');
        return fail(`A Pack must export only one of "agent", "connector", or "pack". Found ${listed}.`);
    }
    // A modern export takes precedence over the legacy manifest.
    if (names.length > 0) {
        return;
    }
    const manifest = moduleExports[PackDefinitionExportName.Manifest];
    if (manifest === undefined) {
        return fail(InvalidDefinitionExport);
    }
    if (!DefinitionExport.safeParse(manifest).success) {
        return fail(InvalidDefinitionExport);
    }
});
/** @internal */
class PackDefinitionExportValidationError extends Error {
}
exports.PackDefinitionExportValidationError = PackDefinitionExportValidationError;
/**
 * Validates a module's Pack definition exports without changing its definitions.
 * Throws an error when export names or definition shapes are invalid.
 *
 * @internal
 */
function validatePackDefinitionExports(moduleExports) {
    const result = PackDefinitionExportModuleSchema.safeParse(moduleExports);
    if (!result.success) {
        throw new PackDefinitionExportValidationError(result.error.issues[0].message);
    }
}
exports.validatePackDefinitionExports = validatePackDefinitionExports;
