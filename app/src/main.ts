import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { Transport, MicroserviceOptions, BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { join } from 'path';
import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {

    const message = exception.getError()

    console.log(message)
    return throwError(() => exception.getError());
  }
}

async function bootstrap() {
  // entry point for microservice, create a grpc server
  // 127.0.0.1:5000 if no host and port provided
  // clients will consume this service via package name

  const app = await NestFactory.createMicroservice(ProductModule, {
    transport: Transport.GRPC,
    url: "localhost:5000",
    options: {
      package: 'Product',
      loader: {
        includeDirs: [
          join(process.cwd(), "../", "../", "libs", 'proto'),
        ]
      },
      protoPath: join(process.cwd(), "../", "../", "libs", 'proto/product.proto'),
    }
  });
  app.useGlobalFilters(new ExceptionFilter())
  await app.listen();
}
bootstrap();


