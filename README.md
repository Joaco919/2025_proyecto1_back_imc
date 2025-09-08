# API Calculadora de IMC

Backend de la Calculadora de IMC, desarrollado con NestJS. Esta API proporciona endpoints para calcular el Índice de Masa Corporal (IMC) y determinar la categoría de peso correspondiente.

## Descripción

Este servicio backend forma parte del proyecto de Calculadora de IMC desarrollado para el curso de Ingeniería de Software. Está construido utilizando NestJS, un framework progresivo de Node.js para crear aplicaciones del lado del servidor eficientes y escalables.

## Endpoints

### Calcular IMC
- **URL**: `/imc/calcular`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "altura": number,  // altura en metros
    "peso": number     // peso en kilogramos
  }
  ```
- **Respuesta**:
  ```json
  {
    "imc": number,     // resultado del cálculo
    "categoria": string // clasificación del IMC
  }
  ```

## Tecnologías Utilizadas

- NestJS
- TypeScript
- class-validator para validación de datos
- Jest para testing

## Características

- Validación de datos de entrada
- Cálculo preciso del IMC
- Clasificación automática según rangos estándar
- Arquitectura modular y escalable
- Tests unitarios

## Desarrollo Local

### Requisitos Previos
- Node.js
- npm o yarn

### Configuración
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar tests
npm run test
```

### Puerto
Por defecto, la aplicación corre en:
```
http://localhost:3000
```

## Despliegue

La API está desplegada en Render y está disponible en:
- [https://two025-proyecto1-back-imc-vlxv.onrender.com](https://two025-proyecto1-back-imc-vlxv.onrender.com)

La aplicación está disponible en:
- [https://2025-proyecto1-front-imc-sepia.vercel.app/](https://2025-proyecto1-front-imc-sepia.vercel.app/)

# Ajustes para Compatibilidad con Render

Se realizaron los siguientes ajustes para compatibilidad con Render:

```
# Ajustes para Compatibilidad con Render

Se realizaron los siguientes ajustes para compatibilidad con Render:

## 1. Puerto dinámico

**Antes:**
```javascript
await app.listen(3000);
```

**Después:**
```javascript
const port = process.env.PORT || 3000;
await app.listen(port);
console.log(`App running on port ${port}`);
```

Render asigna dinámicamente el puerto, por lo que es necesario usar `process.env.PORT`.

## 2. Habilitación de CORS

```javascript
app.enableCors();
```

Permite que el frontend desplegado en Vercel pueda comunicarse con el backend.

## 3. Validación global de datos

```javascript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}));
```

Garantiza que las solicitudes incluyan únicamente los campos esperados y bloquea datos no permitidos.
```

## Autor
- Grupo 12 -
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
