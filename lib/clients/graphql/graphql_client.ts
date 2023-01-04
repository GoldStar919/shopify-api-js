import {ApiVersion, LogSeverity, ShopifyHeader} from '../../types';
import {ConfigInterface} from '../../base-types';
import {httpClientClass, HttpClient} from '../http_client/http_client';
import {DataType, HeaderParams, RequestReturn} from '../http_client/types';
import {Session} from '../../session/session';
import * as ShopifyErrors from '../../error';

import {GraphqlParams, GraphqlClientParams} from './types';

export interface GraphqlClientClassParams {
  config: ConfigInterface;
  HttpClient?: typeof HttpClient;
}

export class GraphqlClient {
  public static CONFIG: ConfigInterface;
  public static HTTP_CLIENT: typeof HttpClient;

  baseApiPath = '/admin/api';
  readonly session: Session;
  readonly client: HttpClient;
  readonly apiVersion?: ApiVersion;

  constructor(params: GraphqlClientParams) {
    if (
      !this.graphqlClass().CONFIG.isPrivateApp &&
      !params.session.accessToken
    ) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Missing access token when creating GraphQL client',
      );
    }

    if (params.apiVersion) {
      this.graphqlClass().CONFIG.logger.log(
        LogSeverity.Debug,
        `GraphQL client overriding API version to ${params.apiVersion}`,
      );
    }

    this.session = params.session;
    this.apiVersion = params.apiVersion;
    this.client = new (this.graphqlClass().HTTP_CLIENT)({
      domain: this.session.shop,
    });
  }

  public async query<T = unknown>(
    params: GraphqlParams,
  ): Promise<RequestReturn<T>> {
    if (
      (typeof params.data === 'string' && params.data.length === 0) ||
      Object.entries(params.data).length === 0
    ) {
      throw new ShopifyErrors.MissingRequiredArgument('Query missing.');
    }

    const apiHeaders = this.getApiHeaders();
    params.extraHeaders = {...apiHeaders, ...params.extraHeaders};

    const path = `${this.baseApiPath}/${
      this.apiVersion || this.graphqlClass().CONFIG.apiVersion
    }/graphql.json`;

    let dataType: DataType.GraphQL | DataType.JSON;

    if (typeof params.data === 'object') {
      dataType = DataType.JSON;
    } else {
      dataType = DataType.GraphQL;
    }

    const result = await this.client.post<T>({
      path,
      type: dataType,
      ...params,
    });

    if ((result.body as unknown as {[key: string]: unknown}).errors) {
      throw new ShopifyErrors.GraphqlQueryError({
        message: 'GraphQL query returned errors',
        response: result.body as unknown as {[key: string]: unknown},
      });
    }
    return result;
  }

  protected getApiHeaders(): HeaderParams {
    return {
      [ShopifyHeader.AccessToken]: this.graphqlClass().CONFIG.isPrivateApp
        ? this.graphqlClass().CONFIG.apiSecretKey
        : (this.session.accessToken as string),
    };
  }

  private graphqlClass() {
    return this.constructor as typeof GraphqlClient;
  }
}

export function graphqlClientClass(
  params: GraphqlClientClassParams,
): typeof GraphqlClient {
  const {config} = params;
  let {HttpClient} = params;
  if (!HttpClient) {
    HttpClient = httpClientClass(params.config);
  }

  class NewGraphqlClient extends GraphqlClient {
    public static CONFIG = config;
    public static HTTP_CLIENT = HttpClient!;
  }

  Reflect.defineProperty(NewGraphqlClient, 'name', {
    value: 'GraphqlClient',
  });

  return NewGraphqlClient as typeof GraphqlClient;
}
