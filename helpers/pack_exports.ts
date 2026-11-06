import {z} from 'zod';

enum PackDefinitionExportName {
  Agent = 'agent',
  Connector = 'connector',
  Pack = 'pack',
  Manifest = 'manifest',
}

const PackDefinitionExportNames = [
  PackDefinitionExportName.Agent,
  PackDefinitionExportName.Connector,
  PackDefinitionExportName.Pack,
];

const InvalidDefinitionExport =
  'Invalid Pack definition export. Export a definition object as "agent", "connector", "pack", or "manifest".';

const DefinitionExport = z.object({});
const AgentExport = z.object({agent: DefinitionExport});
const ConnectorExport = z.object({agent: z.never().optional()});

const PackDefinitionExportModuleSchema = z
  .object({
    agent: z
      .unknown()
      .optional()
      .refine(value => !value || AgentExport.safeParse(value).success, {
        message: 'An agent export must define an agent.',
      }),
    connector: z
      .unknown()
      .optional()
      .refine(value => !value || ConnectorExport.safeParse(value).success, {
        message: 'A connector export must not define an agent.',
      }),
    pack: z
      .unknown()
      .optional()
      .refine(value => !value || DefinitionExport.safeParse(value).success, {
        message: InvalidDefinitionExport,
      }),
    manifest: z.unknown().optional(),
  })
  .superRefine((moduleExports, context) => {
    const fail = (message: string) => context.addIssue({code: 'custom', message});
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
export class PackDefinitionExportValidationError extends Error {}

/**
 * Validates a module's Pack definition exports without changing its definitions.
 * Throws an error when export names or definition shapes are invalid.
 *
 * @internal
 */
export function validatePackDefinitionExports(moduleExports: unknown): void {
  const result = PackDefinitionExportModuleSchema.safeParse(moduleExports);
  if (!result.success) {
    throw new PackDefinitionExportValidationError(result.error.issues[0].message);
  }
}
