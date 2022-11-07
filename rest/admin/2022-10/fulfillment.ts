/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base} from '../../base';
import {ResourcePath} from '../../types';
import {Session} from '../../../lib/session/session';
import {ApiVersion} from '../../../lib/base-types';

interface FindArgs {
  session: Session;
  id: number | string;
  order_id?: number | string | null;
  fields?: unknown;
}
interface AllArgs {
  [key: string]: unknown;
  session: Session;
  fulfillment_order_id?: number | string | null;
  order_id?: number | string | null;
  created_at_max?: unknown;
  created_at_min?: unknown;
  fields?: unknown;
  limit?: unknown;
  since_id?: unknown;
  updated_at_max?: unknown;
  updated_at_min?: unknown;
}
interface CountArgs {
  [key: string]: unknown;
  session: Session;
  order_id?: number | string | null;
  created_at_min?: unknown;
  created_at_max?: unknown;
  updated_at_min?: unknown;
  updated_at_max?: unknown;
}
interface CancelArgs {
  [key: string]: unknown;
  body?: {[key: string]: unknown} | null;
}
interface UpdateTrackingArgs {
  [key: string]: unknown;
  body?: {[key: string]: unknown} | null;
}

export class Fulfillment extends Base {
  public static API_VERSION = ApiVersion.October22;

  protected static NAME = 'fulfillment';
  protected static PLURAL_NAME = 'fulfillments';
  protected static HAS_ONE: {[key: string]: typeof Base} = {};
  protected static HAS_MANY: {[key: string]: typeof Base} = {};
  protected static PATHS: ResourcePath[] = [
    {"http_method": "get", "operation": "count", "ids": ["order_id"], "path": "orders/<order_id>/fulfillments/count.json"},
    {"http_method": "get", "operation": "get", "ids": ["fulfillment_order_id"], "path": "fulfillment_orders/<fulfillment_order_id>/fulfillments.json"},
    {"http_method": "get", "operation": "get", "ids": ["order_id"], "path": "orders/<order_id>/fulfillments.json"},
    {"http_method": "get", "operation": "get", "ids": ["order_id", "id"], "path": "orders/<order_id>/fulfillments/<id>.json"},
    {"http_method": "post", "operation": "cancel", "ids": ["id"], "path": "fulfillments/<id>/cancel.json"},
    {"http_method": "post", "operation": "post", "ids": [], "path": "fulfillments.json"},
    {"http_method": "post", "operation": "update_tracking", "ids": ["id"], "path": "fulfillments/<id>/update_tracking.json"}
  ];

  public static async find(
    {
      session,
      id,
      order_id = null,
      fields = null
    }: FindArgs
  ): Promise<Fulfillment | null> {
    const result = await this.baseFind<Fulfillment>({
      session: session,
      urlIds: {"id": id, "order_id": order_id},
      params: {"fields": fields},
    });
    return result ? result[0] : null;
  }

  public static async all(
    {
      session,
      fulfillment_order_id = null,
      order_id = null,
      created_at_max = null,
      created_at_min = null,
      fields = null,
      limit = null,
      since_id = null,
      updated_at_max = null,
      updated_at_min = null,
      ...otherArgs
    }: AllArgs
  ): Promise<Fulfillment[]> {
    const response = await this.baseFind<Fulfillment>({
      session: session,
      urlIds: {"fulfillment_order_id": fulfillment_order_id, "order_id": order_id},
      params: {"created_at_max": created_at_max, "created_at_min": created_at_min, "fields": fields, "limit": limit, "since_id": since_id, "updated_at_max": updated_at_max, "updated_at_min": updated_at_min, ...otherArgs},
    });

    return response;
  }

  public static async count(
    {
      session,
      order_id = null,
      created_at_min = null,
      created_at_max = null,
      updated_at_min = null,
      updated_at_max = null,
      ...otherArgs
    }: CountArgs
  ): Promise<unknown> {
    const response = await this.request<Fulfillment>({
      http_method: "get",
      operation: "count",
      session: session,
      urlIds: {"order_id": order_id},
      params: {"created_at_min": created_at_min, "created_at_max": created_at_max, "updated_at_min": updated_at_min, "updated_at_max": updated_at_max, ...otherArgs},
      body: {},
      entity: null,
    });

    return response ? response.body : null;
  }

  public async cancel(
    {
      body = null,
      ...otherArgs
    }: CancelArgs
  ): Promise<unknown> {
    const response = await this.request<Fulfillment>({
      http_method: "post",
      operation: "cancel",
      session: this.session,
      urlIds: {"id": this.id},
      params: {...otherArgs},
      body: body,
      entity: this,
    });

    return response ? response.body : null;
  }

  public async update_tracking(
    {
      body = null,
      ...otherArgs
    }: UpdateTrackingArgs
  ): Promise<unknown> {
    const response = await this.request<Fulfillment>({
      http_method: "post",
      operation: "update_tracking",
      session: this.session,
      urlIds: {"id": this.id},
      params: {...otherArgs},
      body: body,
      entity: this,
    });

    return response ? response.body : null;
  }

  public created_at: string | null;
  public id: number | null;
  public line_items: {[key: string]: unknown}[] | null;
  public location_id: number | null;
  public name: string | null;
  public notify_customer: boolean | null;
  public order_id: number | null;
  public origin_address: {[key: string]: unknown}[] | null;
  public receipt: {[key: string]: unknown} | null;
  public service: string | null;
  public shipment_status: string | null;
  public status: string | null;
  public tracking_company: string | null;
  public tracking_numbers: string[] | null;
  public tracking_urls: string[] | null;
  public updated_at: string | null;
  public variant_inventory_management: string | null;
}
