import type {AgentTool} from '../types';
import type {ArgumentsCamelCase} from 'yargs';
import type {Client} from '../helpers/external-api/coda';
import type {CompilePackBundleOptions} from '../testing/compile';
import {PackDefinitionExportValidationError} from '../helpers/pack_exports';
import type {PackMetadataValidationError} from '../testing/upload_validation';
import type {PackVersionDefinition} from '..';
import type {PackVersionMetadata} from '../compiled_types';
import {ToolType} from '../types';
import type {ValidationError} from '../testing/types';
import {compilePackBundle} from '../testing/compile';
import {compilePackMetadata} from '../helpers/metadata';
import {createCodaClient} from './helpers';
import {formatEndpoint} from './helpers';
import {formatError} from './errors';
import {formatResponseError} from './errors';
import {getApiKey} from './config_storage';
import {importManifest} from './helpers';
import {isResponseError} from '../helpers/external-api/coda';
import {isTestCommand} from './helpers';
import {makeManifestFullPath} from './helpers';
import {print} from '../testing/helpers';
import {printAndExit} from '../testing/helpers';
import {validatePackVersionMetadata} from '../testing/upload_validation';

/** Compiles a Pack for CLI commands only, exiting on failure. */
export async function compilePack(
  options: CompilePackBundleOptions,
): Promise<{bundlePath: string; bundleSourceMapPath: string}> {
  try {
    const {bundlePath, bundleSourceMapPath} = await compilePackBundle(options);
    return {bundlePath, bundleSourceMapPath};
  } catch (error: unknown) {
    if (error instanceof PackDefinitionExportValidationError) {
      printAndExit(error.message);
    }
    printAndExit(`Unable to compile Pack: ${formatError(error)}`);
  }
}

interface ValidateArgs {
  manifestFile: string;
  checkDeprecationWarnings: boolean;
  checkConnectors?: boolean;
  apiToken?: string;
  apiEndpoint: string;
}

export async function handleValidate({
  manifestFile,
  checkDeprecationWarnings,
  checkConnectors,
  apiToken,
  apiEndpoint,
}: ArgumentsCamelCase<ValidateArgs>) {
  const fullManifestPath = makeManifestFullPath(manifestFile);
  const {bundlePath} = await compilePack({manifestPath: fullManifestPath, minify: false, validateExports: true});
  const manifest = await importManifest<PackVersionDefinition>(bundlePath);

  // Since it's okay to not specify a version, we inject one if it's not provided.
  if (!manifest.version) {
    manifest.version = '1';
  }

  if (manifest.agent) {
    if ((manifest.agent.tools ?? []).length === 0) {
      print('tools: none (chat-only)');
    }
    if (checkConnectors !== false) {
      const endpoint = formatEndpoint(apiEndpoint);
      const token = apiToken ?? getApiKey(endpoint);
      if (token) {
        const client = createCodaClient(token, endpoint);
        const connectorIds = getConnectorPackIds(manifest.agent.tools ?? []);
        for (const warning of await checkAgentConnectorListings(client, connectorIds)) {
          print(`warning: ${warning}`);
        }
      }
    }
  }

  const metadata = compilePackMetadata(manifest);
  await validateMetadata(metadata, {checkDeprecationWarnings});
  print('valid');
}

export function getConnectorPackIds(tools: AgentTool[]): number[] {
  const packIds: number[] = [];
  for (const tool of tools) {
    if (tool.type === ToolType.Pack) {
      packIds.push(tool.packId);
    }
  }
  return packIds;
}

export async function checkAgentConnectorListings(
  client: Pick<Client, 'getPackListing'>,
  packIds: number[],
): Promise<string[]> {
  const results = await Promise.allSettled(packIds.map(packId => client.getPackListing(packId)));
  const warnings: string[] = [];
  for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
      const err = result.reason;
      if (isResponseError(err)) {
        warnings.push(
          `Connector pack ${packIds[index]} was not found or is not visible to this token: ${await formatResponseError(err)}. ` +
            'Find connector IDs at https://superhuman.com/store/connectors.',
        );
      } else {
        warnings.push(`Could not verify connector pack ${packIds[index]}: ${String(err)}.`);
      }
    }
  }
  return warnings;
}

export async function validateMetadata(
  metadata: PackVersionMetadata,
  {checkDeprecationWarnings = true}: {checkDeprecationWarnings?: boolean} = {},
) {
  // Since package.json isn't in dist, we grab it from the root directory instead.
  const packageJson = await import(isTestCommand() ? '../package.json' : '../../package.json');
  const codaPacksSDKVersion = packageJson.version as string;

  try {
    await validatePackVersionMetadata(metadata, codaPacksSDKVersion);
  } catch (e: any) {
    const packMetadataValidationError = e as PackMetadataValidationError;
    const validationErrors = packMetadataValidationError.validationErrors?.map(makeErrorMessage).join('\n');
    printAndExit(`${e.message}: \n${validationErrors}`);
  }

  // Runs before the deprecation check, which exits when it finds anything.
  const groupSizes = new Map<string, number>();
  for (const tool of metadata.agent?.tools ?? []) {
    if (tool.type === ToolType.Pack && typeof tool.required === 'object') {
      groupSizes.set(tool.required.groupName, (groupSizes.get(tool.required.groupName) ?? 0) + 1);
    }
  }
  for (const [groupName, size] of groupSizes) {
    if (size === 1) {
      print(`warning: Group "${groupName}" has one connector, so it acts like required: true. Check the group name.`);
    }
  }

  if (!checkDeprecationWarnings) {
    return;
  }

  try {
    await validatePackVersionMetadata(metadata, codaPacksSDKVersion, {warningMode: true});
  } catch (e: any) {
    const packMetadataValidationError = e as PackMetadataValidationError;
    const deprecationWarnings = packMetadataValidationError.validationErrors?.map(makeWarningMessage).join('\n');
    printAndExit(`Your Pack is using deprecated properties or features: \n${deprecationWarnings}`, 0);
  }
}

function makeErrorMessage({path, message}: ValidationError): string {
  if (path) {
    return `Error in field at path "${path}": ${message}`;
  }
  return message;
}

function makeWarningMessage({path, message}: ValidationError): string {
  if (path) {
    return `Warning in field at path "${path}": ${message} This will become an error in a future SDK version.`;
  }
  return message;
}
