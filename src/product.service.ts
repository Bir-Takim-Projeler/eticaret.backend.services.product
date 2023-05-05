import { Injectable, OnModuleInit, INestApplication, OnModuleDestroy } from '@nestjs/common';
import { connect, Bucket, Cluster, Scope, Collection, PasswordAuthenticator, DocumentExistsError, IndexExistsError, QueryResult } from "couchbase"
import { Product } from "@libs/entities"
import { RpcException } from '@nestjs/microservices';
import { status} from '@grpc/grpc-js'


@Injectable()
export class ProductService
  implements OnModuleInit, OnModuleDestroy {
  private cluster: Cluster;
  private bucket: Bucket;
  private scope: Scope;
  private collection: Collection;

  constructor() { }

  async onModuleInit() {
    const credentials = new PasswordAuthenticator("administrator", "administrator")
    try {

      this.cluster = await connect("couchbase://localhost", credentials);
      this.bucket = this.cluster.bucket("ecommerce");
      this.scope = this.bucket.scope("_default");
      this.collection = this.scope.collection("products");

    } catch (error) { 
      console.error(error); }
  }

  async onModuleDestroy() {
    //await this.cluster.close()
  }


  /**
   * 
   * @param { string } id  product id
   * @returns { Product | null }
   */
  async GetProductById(id: string): Promise<Product> {
    try {
      return new Product((await this.collection.get(id)).content);
    } catch (error) { 
      throw new RpcException({
        message: "product not found",
        code: status.NOT_FOUND
      })
    }
  }


  /**
   * @description find product by name
   * @param { name: string } data product name 
   * @returns { Product[] | never[] }
   */
  async GetProductByName(data: { name: string }) {

    const result: QueryResult = await this.cluster.query(`
      SELECT * 
      FROM \`ecommerce\`._default.product
      WHERE name = $name
    `,
      {
        parameters: {
          name: data.name
        }
      })

    return result.rows

  }


  async GetProducts(data: { limit: string, skip: string }) { }
}
