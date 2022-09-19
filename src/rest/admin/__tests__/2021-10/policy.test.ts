/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../session/session';
import {testConfig, queueMockResponse} from '../../../../__tests__/test-helper';
import {ApiVersion, Shopify} from '../../../../base-types';
import {shopifyApi} from '../../../..';

import {restResources} from '../../2021-10';

let shopify: Shopify<typeof restResources>;

beforeEach(() => {
  shopify = shopifyApi({
    ...testConfig,
    apiVersion: ApiVersion.October21,
    restResources,
  });
});

describe('Policy resource', () => {
  const domain = 'test-shop.myshopify.io';
  const headers = {'X-Shopify-Access-Token': 'this_is_a_test_token'};
  const session = new Session({
    id: '1234',
    shop: domain,
    state: '1234',
    isOnline: true,
  });
  session.accessToken = 'this_is_a_test_token';

  it('test_1', async () => {
    queueMockResponse(JSON.stringify({"policies": [{"body": "You have 30 days to get a refund", "created_at": "2022-05-04T08:18:52-04:00", "updated_at": "2022-05-04T08:18:52-04:00", "handle": "refund-policy", "title": "Refund policy", "url": "https://jsmith.myshopify.com/548380009/policies/878590291"}]}));

    await shopify.rest.Policy.all({
      session: session,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2021-10/policies.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

});
