import http from 'http';

import jose from 'jose';
import Cookies from 'cookies';

import '../../__tests__/shopify-global';
import {config, setConfig} from '../../config';
import * as ShopifyErrors from '../../error';
import {Session} from '../../auth/session';
import {JwtPayload} from '../decode-session-token';
import deleteCurrentSession from '../delete-current-session';
import loadCurrentSession from '../load-current-session';
import {ShopifyOAuth} from '../../auth/oauth/oauth';

jest.mock('cookies');

describe('deleteCurrenSession', () => {
  let jwtPayload: JwtPayload;
  beforeEach(() => {
    jwtPayload = {
      iss: 'https://test-shop.myshopify.io/admin',
      dest: 'https://test-shop.myshopify.io',
      aud: config.apiKey,
      sub: '1',
      exp: Date.now() / 1000 + 3600,
      nbf: 1234,
      iat: 1234,
      jti: '4321',
      sid: 'abc123',
    };
  });

  it('finds and deletes the current session when using cookies', async () => {
    config.isEmbeddedApp = false;
    setConfig(config);

    const req = {} as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    const cookieId = '1234-this-is-a-cookie-session-id';

    const session = new Session(
      cookieId,
      'test-shop.myshopify.io',
      'state',
      true,
    );
    await expect(config.sessionStorage.storeSession(session)).resolves.toEqual(
      true,
    );

    Cookies.prototype.get.mockImplementation(() => cookieId);

    await expect(deleteCurrentSession(req, res)).resolves.toBe(true);
    await expect(loadCurrentSession(req, res)).resolves.toBe(undefined);
  });

  it('finds and deletes the current session when using JWT', async () => {
    config.isEmbeddedApp = true;
    setConfig(config);

    const token = jwt.sign(jwtPayload, config.apiSecretKey, {
      algorithm: 'HS256',
    });
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    const session = new Session(
      `test-shop.myshopify.io_${jwtPayload.sub}`,
      'test-shop.myshopify.io',
      'state',
      true,
    );
    await expect(config.sessionStorage.storeSession(session)).resolves.toEqual(
      true,
    );

    await expect(deleteCurrentSession(req, res)).resolves.toBe(true);
    await expect(loadCurrentSession(req, res)).resolves.toBe(undefined);
  });

  it('finds and deletes the current offline session when using cookies', async () => {
    config.isEmbeddedApp = false;
    setConfig(config);

    const req = {} as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    const cookieId = ShopifyOAuth.getOfflineSessionId('test-shop.myshopify.io');

    const session = new Session(
      cookieId,
      'test-shop.myshopify.io',
      'state',
      false,
    );
    await expect(config.sessionStorage.storeSession(session)).resolves.toEqual(
      true,
    );

    Cookies.prototype.get.mockImplementation(() => cookieId);

    await expect(deleteCurrentSession(req, res, false)).resolves.toBe(true);
    await expect(loadCurrentSession(req, res, false)).resolves.toBe(undefined);
  });

  it('finds and deletes the current offline session when using JWT', async () => {
    config.isEmbeddedApp = true;
    setConfig(config);

    const token = jwt.sign(jwtPayload, config.apiSecretKey, {
      algorithm: 'HS256',
    });
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    const session = new Session(
      ShopifyOAuth.getOfflineSessionId('test-shop.myshopify.io'),
      'test-shop.myshopify.io',
      'state',
      false,
    );
    await expect(config.sessionStorage.storeSession(session)).resolves.toEqual(
      true,
    );

    await expect(deleteCurrentSession(req, res, false)).resolves.toBe(true);
    await expect(loadCurrentSession(req, res, false)).resolves.toBe(undefined);
  });

  it('throws an error when no cookie is found', async () => {
    config.isEmbeddedApp = false;
    setConfig(config);

    const req = {} as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    Cookies.prototype.get.mockImplementation(() => null);

    await expect(() => deleteCurrentSession(req, res)).rejects.toBeInstanceOf(
      ShopifyErrors.SessionNotFound,
    );
  });

  it('throws an error when authorization header is not a bearer token', async () => {
    config.isEmbeddedApp = true;
    setConfig(config);

    const req = {
      headers: {
        authorization: "What's a bearer token?",
      },
    } as http.IncomingMessage;
    const res = {} as http.ServerResponse;

    await expect(() => deleteCurrentSession(req, res)).rejects.toBeInstanceOf(
      ShopifyErrors.MissingJwtTokenError,
    );
  });
});
