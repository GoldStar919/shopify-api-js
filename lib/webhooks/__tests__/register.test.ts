import {Method, Header} from '@shopify/network';

import {RegisterParams, RegisterReturn, WebhookHandler} from '../types';
import {gdprTopics, ShopifyHeader} from '../../base-types';
import {DataType} from '../../clients/types';
import {queueMockResponse, shopify} from '../../__tests__/test-helper';
import {mockTestRequests} from '../../../adapters/mock/mock_test_requests';
import {queryTemplate} from '../query-template';
import {TEMPLATE_GET_HANDLERS, TEMPLATE_MUTATION} from '../register';
import {InvalidDeliveryMethodError} from '../../error';

import * as mockResponses from './responses';
import {MockResponse} from './responses';
import {EVENT_BRIDGE_HANDLER, HTTP_HANDLER, PUB_SUB_HANDLER} from './handlers';

interface RegisterTestWebhook {
  topic: string;
  handler: WebhookHandler;
  checkMockResponse?: MockResponse;
  responses?: MockResponse[];
}

interface RegisterTestResponse {
  topic: string;
  registerReturn: RegisterReturn;
  expectedSuccess?: boolean;
  responses: MockResponse[];
}

interface MutationParams {
  [key: string]: any;
}

const REGISTER_PARAMS = {
  accessToken: 'some token',
  shop: 'shop1.myshopify.io',
};

describe('shopify.webhooks.register', () => {
  it('sends a post request to the given shop domain with the webhook data as a GraphQL query in the body and the access token in the headers', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = HTTP_HANDLER;
    const responses = [mockResponses.successResponse];

    const registerReturn = await registerWebhook({topic, handler, responses});

    assertWebhookRegistrationRequest('webhookSubscriptionCreate', {
      topic,
      callbackUrl: `"https://test_host_name/webhooks"`,
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('returns a result with success set to false, body set to empty object, when the server doesn’t return a webhookSubscriptionCreate field', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = HTTP_HANDLER;
    const responses = [mockResponses.httpFailResponse];

    const registerReturn = await registerWebhook({topic, handler, responses});

    assertWebhookRegistrationRequest('webhookSubscriptionCreate', {
      topic,
      callbackUrl: `"https://test_host_name/webhooks"`,
    });
    assertRegisterResponse({
      registerReturn,
      topic,
      responses,
      expectedSuccess: false,
    });
  });

  it('sends an EventBridge registration GraphQL query for an EventBridge webhook registration', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = EVENT_BRIDGE_HANDLER;
    const responses = [mockResponses.eventBridgeSuccessResponse];

    const registerReturn = await registerWebhook({topic, handler, responses});

    assertWebhookRegistrationRequest('eventBridgeWebhookSubscriptionCreate', {
      topic,
      arn: '"arn:test"',
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('sends a PubSub registration GraphQL query for a PubSub webhook registration', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = PUB_SUB_HANDLER;
    const responses = [mockResponses.pubSubSuccessResponse];

    const registerReturn = await registerWebhook({topic, handler, responses});

    assertWebhookRegistrationRequest('pubSubWebhookSubscriptionCreate', {
      topic,
      pubSubProject: '"my-project-id"',
      pubSubTopic: '"my-topic-id"',
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('updates a pre-existing webhook if the address stays the same', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler: WebhookHandler = {
      ...HTTP_HANDLER,
      privateMetafieldNamespaces: ['new-private-namespace'],
    };
    const responses = [mockResponses.successUpdateResponse];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.webhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('webhookSubscriptionUpdate', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
      callbackUrl: `"https://test_host_name/webhooks"`,
      privateMetafieldNamespaces: '["new-private-namespace"]',
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('updates a pre-existing eventbridge webhook if the address stays the same', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler: WebhookHandler = {
      ...EVENT_BRIDGE_HANDLER,
      metafieldNamespaces: ['new-namespace'],
    };
    const responses = [mockResponses.eventBridgeSuccessUpdateResponse];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.eventBridgeWebhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('eventBridgeWebhookSubscriptionUpdate', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
      arn: `"arn:test"`,
      metafieldNamespaces: '["new-namespace"]',
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('updates a pre-existing pubsub webhook if the address stays the same', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler: WebhookHandler = {
      ...PUB_SUB_HANDLER,
      includeFields: ['id', 'title'],
    };
    const responses = [mockResponses.pubSubSuccessUpdateResponse];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.pubSubWebhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('pubSubWebhookSubscriptionUpdate', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
      pubSubProject: '"my-project-id"',
      pubSubTopic: '"my-topic-id"',
      includeFields: '["id","title"]',
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('creates a new webhook registration if the path changes, then deletes the old one', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler: WebhookHandler = {
      ...HTTP_HANDLER,
      callbackUrl: '/webhooks/new',
    };
    const responses = [
      mockResponses.successResponse,
      mockResponses.successDeleteResponse,
    ];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.webhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('webhookSubscriptionCreate', {
      topic,
      callbackUrl: `"https://test_host_name/webhooks/new"`,
    });
    assertWebhookRegistrationRequest('webhookSubscriptionDelete', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('creates a new EventBridge webhook registration if the address changes, then deletes the old one', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler: WebhookHandler = {
      ...EVENT_BRIDGE_HANDLER,
      arn: 'arn:test-new',
    };
    const responses = [
      mockResponses.eventBridgeSuccessResponse,
      mockResponses.successDeleteResponse,
    ];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.eventBridgeWebhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('eventBridgeWebhookSubscriptionCreate', {
      topic,
      arn: `"arn:test-new"`,
    });
    assertWebhookRegistrationRequest('webhookSubscriptionDelete', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('creates a new PubSub webhook registration if the address changes, then deletes the old one', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = {...PUB_SUB_HANDLER, pubSubTopic: 'my-new-topic-id'};
    const responses = [
      mockResponses.pubSubSuccessResponse,
      mockResponses.successDeleteResponse,
    ];

    const registerReturn = await registerWebhook({
      topic,
      handler,
      checkMockResponse: mockResponses.pubSubWebhookCheckResponse,
      responses,
    });

    assertWebhookRegistrationRequest('pubSubWebhookSubscriptionCreate', {
      topic,
      pubSubProject: '"my-project-id"',
      pubSubTopic: '"my-new-topic-id"',
    });
    assertWebhookRegistrationRequest('webhookSubscriptionDelete', {
      id: `"${mockResponses.TEST_WEBHOOK_ID}"`,
    });
    assertRegisterResponse({registerReturn, topic, responses});
  });

  it('fails if given an invalid DeliveryMethod', async () => {
    const topic = 'PRODUCTS_CREATE';
    const handler = {...HTTP_HANDLER, deliveryMethod: 'invalid' as any};

    shopify.webhooks.addHandlers({[topic]: handler});

    queueMockResponse(JSON.stringify(mockResponses.webhookCheckEmptyResponse));

    await expect(shopify.webhooks.register(REGISTER_PARAMS)).rejects.toThrow(
      InvalidDeliveryMethodError,
    );
  });

  gdprTopics.forEach((gdprTopic) => {
    it(`does not send a register for ${gdprTopic}`, async () => {
      const handler = HTTP_HANDLER;

      shopify.webhooks.addHandlers({[gdprTopic]: handler});

      queueMockResponse(
        JSON.stringify(mockResponses.webhookCheckEmptyResponse),
      );

      const response = await shopify.webhooks.register(REGISTER_PARAMS);

      expect(mockTestRequests.requestList).toHaveLength(1);
      expect(response[gdprTopic]).toHaveLength(0);
      expect(shopify.webhooks.getTopicsAdded()).toContain(gdprTopic);
    });
  });
});

async function registerWebhook({
  topic,
  handler,
  checkMockResponse = mockResponses.webhookCheckEmptyResponse,
  responses = [],
}: RegisterTestWebhook): Promise<RegisterReturn> {
  shopify.webhooks.addHandlers({[topic]: handler});

  queueMockResponse(JSON.stringify(checkMockResponse));
  responses.forEach((response) => {
    queueMockResponse(JSON.stringify(response));
  });

  const result = await shopify.webhooks.register(REGISTER_PARAMS);

  expect(mockTestRequests.requestList).toHaveLength(responses.length + 1);

  assertWebhookCheckRequest(REGISTER_PARAMS);

  return result;
}

function assertRegisterResponse({
  registerReturn,
  topic,
  expectedSuccess = true,
  responses,
}: RegisterTestResponse) {
  expect(registerReturn[topic]).not.toHaveLength(0);

  registerReturn[topic].forEach((result, i) => {
    expect(result.success).toBe(expectedSuccess);
    expect(result.result).toEqual(responses[i]);
  });
}

function createWebhookCheckQuery() {
  return queryTemplate(TEMPLATE_GET_HANDLERS, {END_CURSOR: 'null'});
}

function createWebhookQuery(mutationName: string, mutationParams: string) {
  return queryTemplate(TEMPLATE_MUTATION, {
    MUTATION_NAME: mutationName,
    MUTATION_PARAMS: mutationParams,
  });
}

function assertWebhookCheckRequest(REGISTER_PARAMS: RegisterParams) {
  expect({
    method: Method.Post.toString(),
    domain: REGISTER_PARAMS.shop,
    path: `/admin/api/${shopify.config.apiVersion}/graphql.json`,
    headers: {
      [Header.ContentType]: DataType.GraphQL.toString(),
      [ShopifyHeader.AccessToken]: REGISTER_PARAMS.accessToken,
    },
    data: createWebhookCheckQuery(),
  }).toMatchMadeHttpRequest();
}

function assertWebhookRegistrationRequest(
  mutationName: string,
  mutationParams: MutationParams,
) {
  const paramsString = Object.entries(mutationParams)
    .map(([key, value]) => `${key}: ${value}`)
    .join(',\n      ');

  expect({
    method: Method.Post.toString(),
    domain: REGISTER_PARAMS.shop,
    path: `/admin/api/${shopify.config.apiVersion}/graphql.json`,
    headers: {
      [Header.ContentType]: DataType.GraphQL.toString(),
      [ShopifyHeader.AccessToken]: REGISTER_PARAMS.accessToken,
    },
    data: createWebhookQuery(mutationName, paramsString),
  }).toMatchMadeHttpRequest();
}
