import type {AWSAccessKeyAuthentication} from './types';
import type {AWSAssumeRoleAuthentication} from './types';
import type {AgentDefinition} from './types';
import type {Authentication} from './types';
import type {AuthenticationType} from './types';
import type {CodaApiBearerTokenAuthentication} from './types';
import type {CustomAuthentication} from './types';
import type {CustomHeaderTokenAuthentication} from './types';
import type {DistributiveOmit} from './type_utils';
import type {EntraCertificateAuthentication} from './types';
import type {Format} from './types';
import type {FormulaMetadata} from './api';
import type {GoogleDomainWideDelegationAuthentication} from './types';
import type {GoogleServiceAccountAuthentication} from './types';
import type {HeaderBearerTokenAuthentication} from './types';
import type {MetadataFormulaMetadata} from './api';
import type {MultiHeaderTokenAuthentication} from './types';
import type {MultiQueryParamTokenAuthentication} from './types';
import type {NoAuthentication} from './types';
import type {OAuth2Authentication} from './types';
import type {OAuth2ClientCredentialsAuthentication} from './types';
import type {ObjectFormulaMetadata} from './api';
import type {PackDefinition} from './types';
import type {PackVersionDefinition} from './types';
import type {PostSetup} from './types';
import type {QueryParamTokenAuthentication} from './types';
import type {Skill} from './types';
import type {SyncTable} from './api';
import type {VariousAuthentication} from './types';
import type {WebBasicAuthentication} from './types';

// TODO(jonathan): Anything in this file that gets exported in index.ts should probably
// be removed from there and put into a separate entrypoint. These types should
// only need to be used by `coda` code that handles implementation and rendering
// of pack listings.

/**
 * @hidden
 * @deprecated Use {@link SyncTableMetadata}.
 */
export type PackSyncTable = SyncTableMetadata;

/** @hidden */
export type SyncTableMetadata = Omit<
  SyncTable,
  'getter' | 'getName' | 'getSchema' | 'listDynamicUrls' | 'searchDynamicUrls' | 'getDisplayUrl'
> & {
  getter: FormulaMetadata;
  isDynamic?: boolean;
  hasDynamicSchema?: boolean;
  getSchema?: MetadataFormulaMetadata;
  getName?: MetadataFormulaMetadata;
  getDisplayUrl?: MetadataFormulaMetadata;
  listDynamicUrls?: MetadataFormulaMetadata;
  searchDynamicUrls?: MetadataFormulaMetadata;
};

/**
 * @hidden
 * @deprecated Use {@link FormatMetadata}.
 */
export interface PackFormatMetadata extends FormatMetadata {}

/** @hidden */
export interface FormatMetadata extends Omit<Format, 'matchers'> {
  matchers: string[];
}

/**
 * @hidden
 * @deprecated Skills are no longer used. Connectors should not set tools.
 */
export type SkillMetadata = Omit<Skill, 'prompt'>;

/**
 * An agent definition without its instructions, for the browser-facing metadata.
 * @internal
 * @hidden
 */
export type AgentMetadata = Omit<AgentDefinition, 'instructions'>;

/** @hidden */
export type PostSetupMetadata = Omit<PostSetup, 'getOptions' | 'getOptionsFormula'> & {
  getOptions?: MetadataFormulaMetadata; // TODO(packs-dev): Make this required after migration.
  getOptionsFormula?: MetadataFormulaMetadata;
};

/** @hidden */
export type AuthenticationMetadata = DistributiveOmit<
  Authentication,
  'getConnectionName' | 'getConnectionUserId' | 'postSetup'
> & {
  getConnectionName?: MetadataFormulaMetadata;
  getConnectionUserId?: MetadataFormulaMetadata;
  postSetup?: PostSetupMetadata[];
};

/** @hidden */
type AuthenticationToMetadata<T extends Authentication> = DistributiveOmit<
  T,
  'getConnectionName' | 'getConnectionUserId' | 'postSetup'
> & {
  getConnectionName?: MetadataFormulaMetadata;
  getConnectionUserId?: MetadataFormulaMetadata;
  postSetup?: PostSetupMetadata[];
};

/** @hidden */
export interface AuthenticationMetadataTypeMap {
  [AuthenticationType.AWSAccessKey]: AuthenticationToMetadata<AWSAccessKeyAuthentication>;
  [AuthenticationType.AWSAssumeRole]: AuthenticationToMetadata<AWSAssumeRoleAuthentication>;
  [AuthenticationType.CodaApiHeaderBearerToken]: AuthenticationToMetadata<CodaApiBearerTokenAuthentication>;
  [AuthenticationType.CustomHeaderToken]: AuthenticationToMetadata<CustomHeaderTokenAuthentication>;
  [AuthenticationType.MultiHeaderToken]: AuthenticationToMetadata<MultiHeaderTokenAuthentication>;
  [AuthenticationType.Custom]: AuthenticationToMetadata<CustomAuthentication>;
  [AuthenticationType.HeaderBearerToken]: AuthenticationToMetadata<HeaderBearerTokenAuthentication>;
  [AuthenticationType.MultiQueryParamToken]: AuthenticationToMetadata<MultiQueryParamTokenAuthentication>;
  [AuthenticationType.None]: AuthenticationToMetadata<NoAuthentication>;
  [AuthenticationType.QueryParamToken]: AuthenticationToMetadata<QueryParamTokenAuthentication>;
  [AuthenticationType.Various]: AuthenticationToMetadata<VariousAuthentication>;
  [AuthenticationType.WebBasic]: AuthenticationToMetadata<WebBasicAuthentication>;
  [AuthenticationType.OAuth2]: AuthenticationToMetadata<OAuth2Authentication>;
  [AuthenticationType.OAuth2ClientCredentials]: AuthenticationToMetadata<OAuth2ClientCredentialsAuthentication>;
  [AuthenticationType.GoogleDomainWideDelegation]: AuthenticationToMetadata<GoogleDomainWideDelegationAuthentication>;
  [AuthenticationType.GoogleServiceAccount]: AuthenticationToMetadata<GoogleServiceAccountAuthentication>;
  [AuthenticationType.EntraCertificate]: AuthenticationToMetadata<EntraCertificateAuthentication>;
}

/**
 * @hidden
 * @deprecated Use {@link Resource}.
 */
export interface PackResource extends Resource {}

/**
 * Resource descriptor carried in versioned component metadata.
 * @hidden
 */
export interface Resource {
  key: string;
  mimeType: 'text/html;profile=mcp-app';
}

/**
 * @hidden
 * @deprecated Use {@link ResourceArtifact}.
 */
export interface PackResourceArtifact extends ResourceArtifact {}

/**
 * Resource body submitted separately from metadata.
 * @hidden
 */
export interface ResourceArtifact {
  resourceKey: string;
  content: string;
}

/**
 * @hidden
 * @deprecated Use {@link ComponentVersionMetadata}.
 */
export type PackVersionMetadata = ComponentVersionMetadata;

// Stripped-down version of `ComponentVersionDefinition` that doesn't contain formula definitions.
/** @hidden */
export type ComponentVersionMetadata = Omit<
  PackVersionDefinition,
  'formulas' | 'formats' | 'defaultAuthentication' | 'syncTables'
> & {
  formulas: FormulaMetadata[];
  /**
   * Shared resources for top-level formula UIs.
   * @hidden
   */
  resources?: PackResource[];
  formats: PackFormatMetadata[];
  syncTables: SyncTableMetadata[];
  defaultAuthentication?: AuthenticationMetadata;
};

/**
 * @hidden
 * @deprecated Use {@link ComponentMetadata}.
 */
export type PackMetadata = ComponentMetadata;

// Stripped-down version of `PackDefinition` that doesn't contain formula definitions.
/** @hidden */
export type ComponentMetadata = ComponentVersionMetadata &
  Pick<
    PackDefinition,
    | 'id'
    | 'name'
    | 'shortDescription'
    | 'description'
    | 'permissionsDescription'
    | 'category'
    | 'logoPath'
    | 'exampleImages'
    | 'exampleVideoIds'
    | 'minimumFeatureSet'
    | 'quotas'
    | 'rateLimits'
    | 'isSystem'
  >;

// Re-exported values for use in browser code.

/**
 * @hidden
 * @deprecated Use {@link ExternalAuthenticationType}.
 */
export type ExternalPackAuthenticationType = ExternalAuthenticationType;

/** @hidden */
export type ExternalAuthenticationType = AuthenticationType;

/**
 * @hidden
 * @deprecated Use {@link ExternalFormulas}.
 */
export type ExternalPackFormulas = ExternalFormulas;

/** @hidden */
export type ExternalFormulas = FormulaMetadata[];

/**
 * @hidden
 * @deprecated Use {@link ExternalObjectFormula}.
 */
export type ExternalObjectPackFormula = ExternalObjectFormula;

/** @hidden */
export type ExternalObjectFormula = ObjectFormulaMetadata;

/**
 * @hidden
 * @deprecated Use {@link ExternalFormula}.
 */
export type ExternalPackFormula = ExternalFormula;

/** @hidden */
export type ExternalFormula = FormulaMetadata;

/**
 * @hidden
 * @deprecated Use {@link ExternalFormat}.
 */
export type ExternalPackFormat = ExternalFormat;

/** @hidden */
export type ExternalFormat = Omit<Format, 'matchers'> & {matchers?: string[]};

/**
 * @hidden
 * @deprecated Use {@link ExternalFormatMetadata}.
 */
export type ExternalPackFormatMetadata = ExternalFormatMetadata & PackFormatMetadata;

/** @hidden */
export type ExternalFormatMetadata = FormatMetadata;

/** @hidden */
export type ExternalSyncTable = SyncTableMetadata;
/**
 * @hidden
 * @deprecated Skills are no longer used. Connectors should not set tools.
 */
export type ExternalSkill = SkillMetadata;

type BasePackVersionMetadata = Omit<
  ComponentVersionMetadata,
  | 'defaultAuthentication'
  | 'systemConnectionAuthentication'
  | 'formulas'
  | 'formats'
  | 'syncTables'
  | 'skills'
  | 'agent'
  | 'defaultTriggers'
  | 'defaultRoutines'
>;

/**
 * @hidden
 * @deprecated Use {@link ExternalComponentVersionMetadata}.
 */
export interface ExternalPackVersionMetadata extends ExternalComponentVersionMetadata {}

// Further stripped-down version of `ComponentVersionMetadata` that contains only what the browser needs.
/** @hidden */
export interface ExternalComponentVersionMetadata extends BasePackVersionMetadata {
  authentication: {
    type: ExternalAuthenticationType;
    params?: Array<{name: string; description: string}>;
    requiresEndpointUrl: boolean;
    endpointDomain?: string;
    postSetup?: PostSetupMetadata[];
    deferConnectionSetup?: boolean;
    shouldAutoAuthSetup?: boolean;
    oauthScopes?: string[];
    oauthAuthorizationUrl?: string;
    oauthTokenUrl?: string;
    useDynamicClientRegistration?: boolean;
    networkDomain?: string | string[];
    endpointKey?: string;
  };
  instructionsUrl?: string;

  // User-facing components
  formulas?: ExternalFormulas;
  formats?: ExternalFormat[];
  syncTables?: ExternalSyncTable[];
  /**
   * @deprecated Skills are no longer used. Connectors should not set tools.
   */
  skills?: ExternalSkill[];
  agent?: AgentMetadata;
}

/**
 * @hidden
 * @deprecated Use {@link ExternalComponentMetadata}.
 */
export type ExternalPackMetadata = ExternalComponentMetadata;

// Further stripped-down version of `ComponentMetadata` that contains only what the browser needs.
/** @hidden */
export type ExternalComponentMetadata = ExternalPackVersionMetadata &
  Pick<
    ComponentMetadata,
    | 'id'
    | 'name'
    | 'shortDescription'
    | 'description'
    | 'permissionsDescription'
    | 'category'
    | 'logoPath'
    | 'exampleImages'
    | 'exampleVideoIds'
    | 'minimumFeatureSet'
    | 'quotas'
    | 'rateLimits'
    | 'isSystem'
  >;

/**
 * @hidden
 * @deprecated Use {@link ComponentUpload}.
 */
export interface PackUpload extends ComponentUpload {}

/** @hidden */
export interface ComponentUpload {
  // ComponentMetadata is only for legacy packs. This should be removed once
  // all the feature's we're relying on from legacy pack defs like quotas
  // have been migrated or retired.
  metadata: ComponentVersionMetadata | ComponentMetadata;
  /**
   * Resource bodies submitted separately from metadata.
   * @hidden
   */
  resourceArtifacts?: PackResourceArtifact[];
  sdkVersion: string;
  bundle: string;
  sourceMap: string;
}
