import '../../__tests__/shopify-global';
import {Session} from '../../auth/session';
import OAuth from '../../auth/oauth';
import deleteOfflineSession from '../delete-offline-session';
import loadOfflineSession from '../load-offline-session';

describe('deleteOfflineSession', () => {
  const shop = 'some-shop.myshopify.com';
  const offlineId = OAuth.getOfflineSessionId(shop);

  beforeEach(() => {
    const offlineSession = new Session(offlineId, shop, 'state', false);
    global.shopify.config.sessionStorage.storeSession(offlineSession);
  });

  it('deletes offline sessions by shop', async () => {
    await expect(deleteOfflineSession(shop)).resolves.toBe(true);
    await expect(loadOfflineSession(shop)).resolves.toBeUndefined();
  });
});
