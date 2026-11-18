/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Authentication } from '../types';
import type { BasicPackDefinition } from '../types';
import { Client } from '../helpers/external-api/coda';
import type { SpawnSyncOptionsWithBufferEncoding } from 'child_process';
export declare function spawnProcess(command: string, { stdio }?: SpawnSyncOptionsWithBufferEncoding): import("child_process").SpawnSyncReturns<Buffer>;
export declare function createCodaClient(apiToken: string, protocolAndHost?: string): Client;
/**
 * Adds `https://` to an API endpoint if needed.
 *
 * @example
 * ```ts
 * formatEndpoint('my-company.coda.io'); // 'https://my-company.coda.io'
 * ```
 */
export declare function formatEndpoint(endpoint: string): string;
/**
 * Derives a browser link base URL from a formatted API endpoint.
 *
 * @example
 * ```ts
 * deriveBrowserEndpoint('https://coda.io'); // 'https://docs.superhuman.com'
 * deriveBrowserEndpoint('https://my-company.coda.io/'); // 'https://my-company.coda.io'
 * ```
 */
export declare function deriveBrowserEndpoint(formattedApiEndpoint: string): string;
export declare function isTestCommand(): boolean;
export declare function makeManifestFullPath(manifestPath: string): string;
export declare function getPackAuth(packDef: BasicPackDefinition): Authentication | undefined;
export declare function importManifest<T extends BasicPackDefinition = BasicPackDefinition>(bundleFilename: string): Promise<T>;
export declare function assertApiToken(codaApiEndpoint: string, cliApiToken?: string): string;
export declare function assertPackId(manifestDir: string, codaApiEndpoint: string): number;
export declare function assertPackIdOrUrl(packIdOrUrl: string): number;
export declare function backfillFromPackConfig(argv: any): void;
