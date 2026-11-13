"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetadata = exports.checkAgentConnectorListings = exports.getConnectorPackIds = exports.handleValidate = exports.compilePack = void 0;
const pack_exports_1 = require("../helpers/pack_exports");
const types_1 = require("../types");
const compile_1 = require("../testing/compile");
const metadata_1 = require("../helpers/metadata");
const helpers_1 = require("./helpers");
const helpers_2 = require("./helpers");
const errors_1 = require("./errors");
const errors_2 = require("./errors");
const config_storage_1 = require("./config_storage");
const helpers_3 = require("./helpers");
const coda_1 = require("../helpers/external-api/coda");
const helpers_4 = require("./helpers");
const helpers_5 = require("./helpers");
const helpers_6 = require("../testing/helpers");
const helpers_7 = require("../testing/helpers");
const upload_validation_1 = require("../testing/upload_validation");
/** Compiles a Pack for CLI commands only, exiting on failure. */
async function compilePack(options) {
    try {
        const { bundlePath, bundleSourceMapPath } = await (0, compile_1.compilePackBundle)(options);
        return { bundlePath, bundleSourceMapPath };
    }
    catch (error) {
        if (error instanceof pack_exports_1.PackDefinitionExportValidationError) {
            (0, helpers_7.printAndExit)(error.message);
        }
        (0, helpers_7.printAndExit)(`Unable to compile Pack: ${(0, errors_1.formatError)(error)}`);
    }
}
exports.compilePack = compilePack;
async function handleValidate({ manifestFile, checkDeprecationWarnings, checkConnectors, apiToken, apiEndpoint, }) {
    var _a, _b;
    const fullManifestPath = (0, helpers_5.makeManifestFullPath)(manifestFile);
    const { bundlePath } = await compilePack({ manifestPath: fullManifestPath, minify: false, validateExports: true });
    const manifest = await (0, helpers_3.importManifest)(bundlePath);
    // Since it's okay to not specify a version, we inject one if it's not provided.
    if (!manifest.version) {
        manifest.version = '1';
    }
    if (manifest.agent) {
        if (((_a = manifest.agent.tools) !== null && _a !== void 0 ? _a : []).length === 0) {
            (0, helpers_6.print)('tools: none (chat-only)');
        }
        if (checkConnectors !== false) {
            const endpoint = (0, helpers_2.formatEndpoint)(apiEndpoint);
            const token = apiToken !== null && apiToken !== void 0 ? apiToken : (0, config_storage_1.getApiKey)(endpoint);
            if (token) {
                const client = (0, helpers_1.createCodaClient)(token, endpoint);
                const connectorIds = getConnectorPackIds((_b = manifest.agent.tools) !== null && _b !== void 0 ? _b : []);
                for (const warning of await checkAgentConnectorListings(client, connectorIds)) {
                    (0, helpers_6.print)(`warning: ${warning}`);
                }
            }
        }
    }
    const metadata = (0, metadata_1.compilePackMetadata)(manifest);
    await validateMetadata(metadata, { checkDeprecationWarnings });
    (0, helpers_6.print)('valid');
}
exports.handleValidate = handleValidate;
function getConnectorPackIds(tools) {
    const packIds = [];
    for (const tool of tools) {
        if (tool.type === types_1.ToolType.Pack) {
            packIds.push(tool.packId);
        }
    }
    return packIds;
}
exports.getConnectorPackIds = getConnectorPackIds;
async function checkAgentConnectorListings(client, packIds) {
    const results = await Promise.allSettled(packIds.map(packId => client.getPackListing(packId)));
    const warnings = [];
    for (const [index, result] of results.entries()) {
        if (result.status === 'rejected') {
            const err = result.reason;
            if ((0, coda_1.isResponseError)(err)) {
                warnings.push(`Connector pack ${packIds[index]} was not found or is not visible to this token: ${await (0, errors_2.formatResponseError)(err)}. ` +
                    'Find connector IDs at https://superhuman.com/store/connectors.');
            }
            else {
                warnings.push(`Could not verify connector pack ${packIds[index]}: ${String(err)}.`);
            }
        }
    }
    return warnings;
}
exports.checkAgentConnectorListings = checkAgentConnectorListings;
async function validateMetadata(metadata, { checkDeprecationWarnings = true } = {}) {
    var _a, _b, _c, _d, _e;
    // Since package.json isn't in dist, we grab it from the root directory instead.
    const packageJson = await Promise.resolve(`${(0, helpers_4.isTestCommand)() ? '../package.json' : '../../package.json'}`).then(s => __importStar(require(s)));
    const codaPacksSDKVersion = packageJson.version;
    try {
        await (0, upload_validation_1.validatePackVersionMetadata)(metadata, codaPacksSDKVersion);
    }
    catch (e) {
        const packMetadataValidationError = e;
        const validationErrors = (_a = packMetadataValidationError.validationErrors) === null || _a === void 0 ? void 0 : _a.map(makeErrorMessage).join('\n');
        (0, helpers_7.printAndExit)(`${e.message}: \n${validationErrors}`);
    }
    // Runs before the deprecation check, which exits when it finds anything.
    const groupSizes = new Map();
    for (const tool of (_c = (_b = metadata.agent) === null || _b === void 0 ? void 0 : _b.tools) !== null && _c !== void 0 ? _c : []) {
        if (tool.type === types_1.ToolType.Pack && typeof tool.required === 'object') {
            groupSizes.set(tool.required.groupName, ((_d = groupSizes.get(tool.required.groupName)) !== null && _d !== void 0 ? _d : 0) + 1);
        }
    }
    for (const [groupName, size] of groupSizes) {
        if (size === 1) {
            (0, helpers_6.print)(`warning: Group "${groupName}" has one connector, so it acts like required: true. Check the group name.`);
        }
    }
    if (!checkDeprecationWarnings) {
        return;
    }
    try {
        await (0, upload_validation_1.validatePackVersionMetadata)(metadata, codaPacksSDKVersion, { warningMode: true });
    }
    catch (e) {
        const packMetadataValidationError = e;
        const deprecationWarnings = (_e = packMetadataValidationError.validationErrors) === null || _e === void 0 ? void 0 : _e.map(makeWarningMessage).join('\n');
        (0, helpers_7.printAndExit)(`Your Pack is using deprecated properties or features: \n${deprecationWarnings}`, 0);
    }
}
exports.validateMetadata = validateMetadata;
function makeErrorMessage({ path, message }) {
    if (path) {
        return `Error in field at path "${path}": ${message}`;
    }
    return message;
}
function makeWarningMessage({ path, message }) {
    if (path) {
        return `Warning in field at path "${path}": ${message} This will become an error in a future SDK version.`;
    }
    return message;
}
