import type {ArgumentsCamelCase} from 'yargs';
import {buildAgentRouteUrl} from './agent_api';
import {confirmOrFail} from './confirm';
import {formatEndpoint} from './helpers';
import {postAgentRoute} from './agent_api';
import {print} from '../testing/helpers';
import {printAndExit} from '../testing/helpers';
import {resolveAgentContext} from './agent_api';

export interface AgentInstallArgs {
  manifestPath: string;
  version?: string;
  reinstall?: boolean;
  yes?: boolean;
  apiToken?: string;
  apiEndpoint: string;
}

export function buildAgentInstallUrl(apiEndpoint: string, packId: number, version: string): string {
  return buildAgentRouteUrl(apiEndpoint, packId, version, 'agentInstall');
}

// The settings page lives on Go Home, not on the Packs API host.
const GO_HOME_ORIGIN_BY_API_HOST: Record<string, string> = {
  'coda.io': 'https://go.superhuman.com',
  'docs.superhuman.com': 'https://go.superhuman.com',
  'staging.coda.io': 'https://go.pp-sh.io',
  'docs.pp-sh.io': 'https://go.pp-sh.io',
  'head.coda.io': 'https://go.qa-sh.io',
  'docs.qa-sh.io': 'https://go.qa-sh.io',
};

export function buildAgentSettingsUrl(apiEndpoint: string, agentInstanceId: string): string | undefined {
  let hostname: string;
  try {
    hostname = new URL(formatEndpoint(apiEndpoint)).hostname;
  } catch {
    return;
  }
  const origin = GO_HOME_ORIGIN_BY_API_HOST[hostname];
  if (!origin) {
    return;
  }
  return `${origin}/builder/${encodeURIComponent(agentInstanceId)}`;
}

function missingInstallRouteMessage(url: string): string {
  return (
    'The agent install endpoint is not available on this server.\n' +
    `  attempted: POST ${url}\n` +
    'The server needs a token-authed install route that binds a pack version to your account.\n' +
    'Until then: open the agent directory, search the agent by name, and click Open → install agent.'
  );
}

interface AgentInstallResponse {
  agentInstanceId: string;
  tenantId?: string;
  alreadyInstalled: boolean;
}

function readInstallResponse(body: unknown): AgentInstallResponse | undefined {
  if (typeof body !== 'object' || body === null) {
    return;
  }
  const record = body as {agentInstanceId?: unknown; tenantId?: unknown; alreadyInstalled?: unknown};
  if (typeof record.agentInstanceId !== 'string' || record.agentInstanceId.trim() === '') {
    return;
  }
  const tenantId = typeof record.tenantId === 'string' && record.tenantId.trim() !== '' ? record.tenantId : undefined;
  return {
    agentInstanceId: record.agentInstanceId,
    tenantId,
    alreadyInstalled: record.alreadyInstalled === true,
  };
}

function formatInstallResult({
  reinstall,
  alreadyInstalled,
  resolvedVersion,
  packId,
  agentInstanceId,
  tenantId,
  settingsUrl,
}: {
  reinstall: boolean;
  alreadyInstalled: boolean;
  resolvedVersion: string;
  packId: number;
  agentInstanceId: string;
  tenantId?: string;
  settingsUrl?: string;
}): string {
  const identity = [`  agent instance: ${agentInstanceId}`];
  if (tenantId) {
    identity.push(`  tenant: ${tenantId}`);
  }
  if (settingsUrl) {
    identity.push(`  settings: ${settingsUrl}`);
  }
  const ids = identity.join('\n');
  if (reinstall) {
    return (
      `Reinstalled agent version ${resolvedVersion} of pack ${packId}.\n` +
      `${ids}\n` +
      'Tool grants and triggers rebound to this version.'
    );
  }
  if (alreadyInstalled) {
    return (
      `Agent version ${resolvedVersion} of pack ${packId} is already installed.\n` +
      `${ids}\n` +
      'Reinstall to rebind tool grants and triggers after changing them.'
    );
  }
  return (
    `Installed agent version ${resolvedVersion} of pack ${packId}.\n` +
    `${ids}\n` +
    'Triggers and tool grants copied at install time — reinstall after changing tools or triggers.'
  );
}

export async function handleAgentInstall({
  manifestPath,
  version,
  reinstall,
  yes,
  apiToken,
  apiEndpoint,
}: ArgumentsCamelCase<AgentInstallArgs>) {
  const {
    packId,
    resolvedVersion,
    apiToken: token,
  } = await resolveAgentContext({
    manifestPath,
    version,
    apiToken,
    apiEndpoint,
  });

  if (reinstall) {
    confirmOrFail({
      yes,
      prompt: `Reinstall version ${resolvedVersion}? This rebinds tool grants and triggers (y/N)? `,
      example: 'packs agent install pack.ts --reinstall --yes',
    });
  }

  const response = await postAgentRoute(
    'agentInstall',
    {
      apiToken: token,
      apiEndpoint,
      packId,
      version: resolvedVersion,
      progressVerb: 'installing the agent',
      commandNoun: 'install',
      missingRouteMessage: missingInstallRouteMessage,
    },
    {reinstall: reinstall ?? false},
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch (err: any) {
    return printAndExit(`Agent install failed: the server response was not JSON. ${err}`);
  }
  const install = readInstallResponse(body);
  if (!install) {
    return printAndExit('Agent install failed: the server response did not include an agent instance id.');
  }

  print(
    formatInstallResult({
      reinstall: reinstall ?? false,
      alreadyInstalled: install.alreadyInstalled,
      resolvedVersion,
      packId,
      agentInstanceId: install.agentInstanceId,
      tenantId: install.tenantId,
      settingsUrl: buildAgentSettingsUrl(apiEndpoint, install.agentInstanceId),
    }),
  );
}
