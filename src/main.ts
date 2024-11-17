import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SERVER_PORT } from './constants'; // Ensure this constant is properly defined and imported
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  const description = `
    A secure and scalable API designed to power the Lidapay ecosystem, providing a seamless experience for users across various platforms.
    Powered by Advansis Technologies.

    [Base URL](https://restapi.advansistechnologies.com)
    [API Documentation](https://advansis.technologies.com/api-doc)

    Lidapay API provides services for airtime, mobile money and internet bundle across networks locally and internationally. 

    Lead Developer: Hanson Peprah
    Send email to support.it@advansistechnologies.com
    
  `;

  const config = new DocumentBuilder()
    .setTitle('Lidapay API')
    .setDescription(description)
    .setVersion('1.0')
    .addTag('Lidapay')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Lidapay API Documentation',
  });

  const port = parseInt(process.env.PORT, 10) || SERVER_PORT;

  try {
    await app.listen(port);
    logger.debug(`Lidapay web-service is running on: ${await app.getUrl()}`);
  } catch (error) {
    logger.error(`Error starting Lidapay app: ${error.message}`);
    throw error; // re-throw the error
  }
}

bootstrap();