import {Session} from '../../../auth/session';
import {Context} from '../../../context';
import {ApiVersion} from '../../../base-types';

import {PaymentTransaction} from '../../2021-04';

describe('PaymentTransaction resource', () => {
  const domain = 'test-shop.myshopify.io';
  const headers = {'X-Shopify-Access-Token': 'this_is_a_test_token'};
  const test_session = new Session('1234', domain, '1234', true);
  test_session.accessToken = 'this_is_a_test_token';

  beforeEach(() => {
    Context.API_VERSION = ApiVersion.April21;
  });

  it('test_1', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));

    await PaymentTransaction.transactions({
      session: test_session,
      payout_id: "623721858",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2021-04/shopify_payments/balance/transactions.json',
      query: 'payout_id=623721858',
      headers,
      data: null
    }).toMatchMadeHttpRequest();
  });

});
