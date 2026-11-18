import type {ArgumentsCamelCase} from 'yargs';
import {assertApiToken} from './helpers';
import {assertPackIdOrUrl} from './helpers';
import {confirmOrFail} from './confirm';
import {createCodaClient} from './helpers';
import {deriveBrowserEndpoint} from './helpers';
import {formatEndpoint} from './helpers';
import {formatResponseError} from './errors';
import {getPackId} from './config_storage';
import {isResponseError} from '../helpers/external-api/coda';
import {printAndExit} from '../testing/helpers';
import {storePackId} from './config_storage';

const CodaPackHost = /[^/]*coda.io/;
const DocsPackHost = /(?:[^/]*\.)?docs\.(?:superhuman\.com|pp-sh\.io|qa-sh\.io)/;
const PackEditPath = /\/p\/([0-9]+)(:?[^0-9].*)?$/;
const PackGalleryPath = /\/packs\/[^/]*-([0-9]+)$/;
const PackPlainIdRegex = /^([0-9]+)$/;
const PackRegexes = [
  ...[CodaPackHost, DocsPackHost].flatMap(host =>
    [PackEditPath, PackGalleryPath].map(path => new RegExp(`^https://${host.source}(?::[0-9]+)?${path.source}`)),
  ),
  PackPlainIdRegex,
];

interface LinkArgs {
  manifestDir: string;
  apiEndpoint: string;
  packIdOrUrl: string;
  apiToken?: string;
  yes?: boolean;
}

export async function handleLink({manifestDir, apiEndpoint, packIdOrUrl, apiToken, yes}: ArgumentsCamelCase<LinkArgs>) {
  // TODO(dweitzman): Add a download command to fetch the latest code from
  // the server and ask people if they want to download after linking.
  const formattedEndpoint = formatEndpoint(apiEndpoint);
  const webEndpoint = deriveBrowserEndpoint(formattedEndpoint);
  apiToken = assertApiToken(apiEndpoint, apiToken);
  const packId = assertPackIdOrUrl(packIdOrUrl);

  const codaClient = createCodaClient(apiToken, formattedEndpoint);

  // Verify that the user has edit access to the pack. Currently only editors
  // can call getPack().
  try {
    await codaClient.getPack(packId);
  } catch (err: any) {
    if (isResponseError(err)) {
      const serverError = await formatResponseError(err);
      switch (err.response.status) {
        case 401:
        case 403:
        case 404:
          return printAndExit(`You don't have permission to edit this pack: ${serverError}`);
        default:
          return printAndExit(`Error while looking up pack: ${serverError}`);
      }
    }
    throw err;
  }

  const existingPackId = getPackId(manifestDir, apiEndpoint);
  if (existingPackId) {
    if (existingPackId === packId) {
      return printAndExit(`already linked pack_id: ${existingPackId}\nurl: ${webEndpoint}/p/${existingPackId}`, 0);
    }

    confirmOrFail({
      yes,
      prompt: `Overwrite existing deploy to pack ${webEndpoint}/p/${existingPackId} with ${webEndpoint}/p/${packId} instead? (y/N): `,
      example: `packs link ${manifestDir} ${packId} --yes`,
    });
  }

  storePackId(manifestDir, packId, apiEndpoint);
  return printAndExit(`linked pack_id: ${packId}\nurl: ${webEndpoint}/p/${packId}`, 0);
}

export function parsePackIdOrUrl(packIdOrUrl: string): number | null {
  for (const regex of PackRegexes) {
    const match = packIdOrUrl.match(regex);
    if (match) {
      const matchedNumber = match[1];
      return Number(matchedNumber);
    }
  }
  return null;
}
