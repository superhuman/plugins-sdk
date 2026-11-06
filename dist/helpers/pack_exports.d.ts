/** @internal */
export declare class PackDefinitionExportValidationError extends Error {
}
/**
 * Validates a module's Pack definition exports without changing its definitions.
 * Throws an error when export names or definition shapes are invalid.
 *
 * @internal
 */
export declare function validatePackDefinitionExports(moduleExports: unknown): void;
