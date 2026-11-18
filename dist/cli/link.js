"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePackIdOrUrl = exports.handleLink = void 0;
const helpers_1 = require("./helpers");
const helpers_2 = require("./helpers");
const confirm_1 = require("./confirm");
const helpers_3 = require("./helpers");
const helpers_4 = require("./helpers");
const helpers_5 = require("./helpers");
const errors_1 = require("./errors");
const config_storage_1 = require("./config_storage");
const coda_1 = require("../helpers/external-api/coda");
const helpers_6 = require("../testing/helpers");
const config_storage_2 = require("./config_storage");
const CodaPackHost = /[^/]*coda.io/;
const DocsPackHost = /(?:[^/]*\.)?docs\.(?:superhuman\.com|pp-sh\.io|qa-sh\.io)/;
const PackEditPath = /\/p\/([0-9]+)(:?[^0-9].*)?$/;
const PackGalleryPath = /\/packs\/[^/]*-([0-9]+)$/;
const PackPlainIdRegex = /^([0-9]+)$/;
const PackRegexes = [
    ...[CodaPackHost, DocsPackHost].flatMap(host => [PackEditPath, PackGalleryPath].map(path => new RegExp(`^https://${host.source}(?::[0-9]+)?${path.source}`))),
    PackPlainIdRegex,
];
async function handleLink({ manifestDir, apiEndpoint, packIdOrUrl, apiToken, yes }) {
    // TODO(dweitzman): Add a download command to fetch the latest code from
    // the server and ask people if they want to download after linking.
    const formattedEndpoint = (0, helpers_5.formatEndpoint)(apiEndpoint);
    const webEndpoint = (0, helpers_4.deriveBrowserEndpoint)(formattedEndpoint);
    apiToken = (0, helpers_1.assertApiToken)(apiEndpoint, apiToken);
    const packId = (0, helpers_2.assertPackIdOrUrl)(packIdOrUrl);
    const codaClient = (0, helpers_3.createCodaClient)(apiToken, formattedEndpoint);
    // Verify that the user has edit access to the pack. Currently only editors
    // can call getPack().
    try {
        await codaClient.getPack(packId);
    }
    catch (err) {
        if ((0, coda_1.isResponseError)(err)) {
            const serverError = await (0, errors_1.formatResponseError)(err);
            switch (err.response.status) {
                case 401:
                case 403:
                case 404:
                    return (0, helpers_6.printAndExit)(`You don't have permission to edit this pack: ${serverError}`);
                default:
                    return (0, helpers_6.printAndExit)(`Error while looking up pack: ${serverError}`);
            }
        }
        throw err;
    }
    const existingPackId = (0, config_storage_1.getPackId)(manifestDir, apiEndpoint);
    if (existingPackId) {
        if (existingPackId === packId) {
            return (0, helpers_6.printAndExit)(`already linked pack_id: ${existingPackId}\nurl: ${webEndpoint}/p/${existingPackId}`, 0);
        }
        (0, confirm_1.confirmOrFail)({
            yes,
            prompt: `Overwrite existing deploy to pack ${webEndpoint}/p/${existingPackId} with ${webEndpoint}/p/${packId} instead? (y/N): `,
            example: `packs link ${manifestDir} ${packId} --yes`,
        });
    }
    (0, config_storage_2.storePackId)(manifestDir, packId, apiEndpoint);
    return (0, helpers_6.printAndExit)(`linked pack_id: ${packId}\nurl: ${webEndpoint}/p/${packId}`, 0);
}
exports.handleLink = handleLink;
function parsePackIdOrUrl(packIdOrUrl) {
    for (const regex of PackRegexes) {
        const match = packIdOrUrl.match(regex);
        if (match) {
            const matchedNumber = match[1];
            return Number(matchedNumber);
        }
    }
    return null;
}
exports.parsePackIdOrUrl = parsePackIdOrUrl;
