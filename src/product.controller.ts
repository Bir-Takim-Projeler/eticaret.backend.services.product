import { Product } from '@libs/entities';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';


@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @GrpcMethod("ProductService")
  async GetProductById({ id }: { id: string }): Promise<Product> {
    try {
      const data = await this.productService.GetProductById(id);
      return data;
    } catch(error) {
      throw error;
    }
  }
}

