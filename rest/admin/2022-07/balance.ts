/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base} from '../../base';
import {ResourcePath} from '../../types';
import {Session} from '../../../lib/session/session';
import {ApiVersion} from '../../../lib/types';

interface AllArgs {
  [key: string]: unknown;
  session: Session;
}

export class Balance extends Base {
  public static API_VERSION = ApiVersion.July22;

  protected static NAME = 'balance';
  protected static PLURAL_NAME = 'balances';
  protected static HAS_ONE: {[key: string]: typeof Base} = {};
  protected static HAS_MANY: {[key: string]: typeof Base} = {};
  protected static PATHS: ResourcePath[] = [
    {"http_method": "get", "operation": "get", "ids": [], "path": "shopify_payments/balance.json"}
  ];

  public static async all(
    {
      session,
      ...otherArgs
    }: AllArgs
  ): Promise<Balance[]> {
    const response = await this.baseFind<Balance>({
      session: session,
      urlIds: {},
      params: {...otherArgs},
    });

    return response;
  }

}
