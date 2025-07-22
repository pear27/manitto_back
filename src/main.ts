import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://manitto-front.vercel.app', // 허용할 프론트엔드 주소 <-
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 쿠키, 인증 헤더 허용 여부
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running!`);
}
bootstrap();
