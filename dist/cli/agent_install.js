"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAgentInstall = exports.buildAgentSettingsUrl = exports.buildAgentInstallUrl = void 0;
const agent_api_1 = require("./agent_api");
const confirm_1 = require("./confirm");
const helpers_1 = require("./helpers");
const agent_api_2 = require("./agent_api");
const helpers_2 = require("../testing/helpers");
const helpers_3 = require("../testing/helpers");
const agent_api_3 = require("./agent_api");
function buildAgentInstallUrl(apiEndpoint, packId, version) {
    return (0, agent_api_1.buildAgentRouteUrl)(apiEndpoint, packId, version, 'agentInstall');
}
exports.buildAgentInstallUrl = buildAgentInstallUrl;
// The settings page lives on Go Home, not on the Packs API host.
const GO_HOME_ORIGIN_BY_API_HOST = {
    'coda.io': 'https://go.superhuman.com',
    'docs.superhuman.com': 'https://go.superhuman.com',
    'staging.coda.io': 'https://go.pp-sh.io',
    'docs.pp-sh.io': 'https://go.pp-sh.io',
    'head.coda.io': 'https://go.qa-sh.io',
    'docs.qa-sh.io': 'https://go.qa-sh.io',
};
function buildAgentSettingsUrl(apiEndpoint, agentInstanceId) {
    let hostname;
    try {
        hostname = new URL((0, helpers_1.formatEndpoint)(apiEndpoint)).hostname;
    }
    catch {
        return;
    }
    const origin = GO_HOME_ORIGIN_BY_API_HOST[hostname];
    if (!origin) {
        return;
    }
    return `${origin}/builder/${encodeURIComponent(agentInstanceId)}`;
}
exports.buildAgentSettingsUrl = buildAgentSettingsUrl;
function missingInstallRouteMessage(url) {
    return ('The agent install endpoint is not available on this server.\n' +
        `  attempted: POST ${url}\n` +
        'The server needs a token-authed install route that binds a pack version to your account.\n' +
        'Until then: open the agent directory, search the agent by name, and click Open → install agent.');
}
function readInstallResponse(body) {
    if (typeof body !== 'object' || body === null) {
        return;
    }
    const record = body;
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
function formatInstallResult({ reinstall, alreadyInstalled, resolvedVersion, packId, agentInstanceId, tenantId, settingsUrl, }) {
    const identity = [`  agent instance: ${agentInstanceId}`];
    if (tenantId) {
        identity.push(`  tenant: ${tenantId}`);
    }
    if (settingsUrl) {
        identity.push(`  settings: ${settingsUrl}`);
    }
    const ids = identity.join('\n');
    if (reinstall) {
        return (`Reinstalled agent version ${resolvedVersion} of pack ${packId}.\n` +
            `${ids}\n` +
            'Tool grants and triggers rebound to this version.');
    }
    if (alreadyInstalled) {
        return (`Agent version ${resolvedVersion} of pack ${packId} is already installed.\n` +
            `${ids}\n` +
            'Reinstall to rebind tool grants and triggers after changing them.');
    }
    return (`Installed agent version ${resolvedVersion} of pack ${packId}.\n` +
        `${ids}\n` +
        'Triggers and tool grants copied at install time — reinstall after changing tools or triggers.');
}
async function handleAgentInstall({ manifestPath, version, reinstall, yes, apiToken, apiEndpoint, }) {
    const { packId, resolvedVersion, apiToken: token, } = await (0, agent_api_3.resolveAgentContext)({
        manifestPath,
        version,
        apiToken,
        apiEndpoint,
    });
    if (reinstall) {
        (0, confirm_1.confirmOrFail)({
            yes,
            prompt: `Reinstall version ${resolvedVersion}? This rebinds tool grants and triggers (y/N)? `,
            example: 'packs agent install pack.ts --reinstall --yes',
        });
    }
    const response = await (0, agent_api_2.postAgentRoute)('agentInstall', {
        apiToken: token,
        apiEndpoint,
        packId,
        version: resolvedVersion,
        progressVerb: 'installing the agent',
        commandNoun: 'install',
        missingRouteMessage: missingInstallRouteMessage,
    }, { reinstall: reinstall !== null && reinstall !== void 0 ? reinstall : false });
    let body;
    try {
        body = await response.json();
    }
    catch (err) {
        return (0, helpers_3.printAndExit)(`Agent install failed: the server response was not JSON. ${err}`);
    }
    const install = readInstallResponse(body);
    if (!install) {
        return (0, helpers_3.printAndExit)('Agent install failed: the server response did not include an agent instance id.');
    }
    (0, helpers_2.print)(formatInstallResult({
        reinstall: reinstall !== null && reinstall !== void 0 ? reinstall : false,
        alreadyInstalled: install.alreadyInstalled,
        resolvedVersion,
        packId,
        agentInstanceId: install.agentInstanceId,
        tenantId: install.tenantId,
        settingsUrl: buildAgentSettingsUrl(apiEndpoint, install.agentInstanceId),
    }));
}
exports.handleAgentInstall = handleAgentInstall;
