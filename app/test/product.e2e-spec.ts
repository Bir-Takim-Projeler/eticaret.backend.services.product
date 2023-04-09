import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import * as request from 'supertest';
import { ProductService } from '../src/product.service';
import { PriceType } from '@libs/entities/src';
import { ProductController } from '../src/product.controller';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { Product } from '@libs/entities/src';
import { productStub } from '../src/__mocks__/product.service';

jest.mock("../src/product.service")
describe('ProductController e2e', () => {
  let app: INestMicroservice | INestMicroservice & { Close: () => void };

  let defn;
  let client;

  beforeAll(() => {
    defn = protoLoader.loadSync(join(process.cwd(), "../", "../", "libs", 'proto/products.proto'), {
      enums: String,
      oneofs: true
    });
    const proto: any = grpc.loadPackageDefinition(defn).product;
    client = new proto.ProductController("localhost:5000", grpc.credentials.createInsecure());
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService]
    })
      .compile();

    jest.clearAllMocks()
    app = await moduleFixture.createNestMicroservice({
      transport: Transport.GRPC,
      options: {
        package: 'product',

        protoPath: join(process.cwd(), "../", "../", "libs", 'proto/products.proto'),
      } as MicroserviceOptions,
    });
    await app.listen();
  });

  it('/ (GET)', async () => {
    const result: Product = await new Promise(async resolve => {
      client.GetProductById({ id: "1" }, (err, res: { data?: Product, error?: { message: string, code: string } }) => {
        resolve(new Product(res.data))
      })
    })

    /**
     * @caglar 
     * look at libs/entities/src/product.ts
     * javascript cant safely serialize decimals. 
     * so now decimals fixed to (3) at entity file constructor
     */
    expect(result).toEqual(productStub("1"))
  });

  afterAll(() => {
    app.close();
  })


});

