# Theoretical Concepts (Arquitectura Hexagonal)

## Hito 1: La Capa de Dominio (El Corazón de HexaBank)
**Concepto Teórico: Independencia del Dominio**
Según nuestro Manifiesto de Arquitectura, la capa de Dominio es donde vive la "verdad" del negocio.

**Regla de Oro:** Esta capa no sabe que existe NestJS, ni que existe una base de datos SQL, ni que existe la web.

**Por qué:** Si mañana decidimos cambiar NestJS por otro framework o TypeORM por Prisma, el archivo de la entidad Account no se toca.

---

## Hito 2: Capa de Aplicación y Casos de Uso
**Concepto Teórico: La Orquesta (Casos de Uso)**
Según nuestro Manifiesto de Arquitectura, la Capa de Aplicación contiene los Servicios que ejecutan tareas específicas del negocio.

**Casos de Uso:** Un servicio no es un "basurero" de funciones. Cada método debe representar una acción del usuario (ej. WithdrawMoneyService o un método execute dentro de un servicio).

**Inyección de Dependencias (DI):** Es el pilar de NestJS. En lugar de crear instancias con new, NestJS nos "pasa" las herramientas que necesitamos.

**Puertos vs. Adaptadores:** El servicio de aplicación solo conoce la Interfaz (AccountRepository), no la implementación real (TypeORM/Prisma). Esto permite que el servicio sea testeable al 100% con mocks.

---

## Hito 3: Capa de Infraestructura (Adaptadores y Persistencia)
**Concepto Teórico: El Patrón Repositorio y el Desacoplamiento**
Según nuestro Manifiesto de Arquitectura, la infraestructura es un "detalle técnico". Aquí es donde implementamos los Puertos que definimos en el Dominio.

**Adaptadores de Salida (Persistencia):** Es la clase que implementa la interfaz AccountRepository. Aquí sí podemos usar TypeORM, Prisma o incluso un simple mapa en memoria para empezar.

**Adaptadores de Entrada (Controladores):** Son los que exponen nuestro Caso de Uso al exterior (HTTP/REST).

**Mapeo de Datos:** Un error común es usar la misma clase para la DB y para el Dominio. Un Senior prefiere separar la AccountSchema (entidad del ORM) de la Account (entidad de negocio) y usar un Mapper para pasar de una a otra.

---

## Hito 4: Contratos, Validación y Transformación (DTOs & Pipes)
**Concepto Teórico: La Integridad como Norma**
Según nuestro Manifiesto de Arquitectura, la integridad de los datos es innegociable. No permitimos que "cualquier cosa" entre a nuestros Casos de Uso.

**DTO (Data Transfer Object):** Es un objeto que define estrictamente el formato de los datos que viajan por la red. Es el "contrato" entre el cliente y el servidor.

**ValidationPipe:** Es un Pipe (tubo) de NestJS que intercepta la petición, valida los datos contra el DTO y, si algo falla, devuelve un 400 Bad Request automáticamente sin llegar siquiera al servicio.

**Whitelist & Forbidden:** Un Senior configura el Pipe para que borre cualquier propiedad que no esté definida en el DTO (ej. si el cliente intenta inyectar un campo role: 'admin').

---

## Hito 5: Persistencia Real (TypeORM y el Patrón Mapper)
**Concepto Teórico: Desacoplamiento de Persistencia**
Hasta ahora hemos usado un repositorio en memoria. Para pasar a una base de datos real (PostgreSQL/MySQL), un Senior sigue la regla del Manifiesto de Arquitectura: el servicio no debe cambiar aunque cambiemos la base de datos.

**Entidad de Dominio vs. Entidad de ORM:** Aquí es donde muchos fallan.

La Entidad de Dominio (Account) tiene lógica de negocio y es TypeScript puro.

La Entidad de Infraestructura (AccountSchema o AccountOrmEntity) tiene decoradores @Entity(), @Column(), etc.

**Concepto Teórico: Mapeo de Datos (Data Mapper)**
Según nuestro manifiesto, el Dominio no debe conocer al ORM.

**Entidad de Dominio (Account):** Contiene la lógica (withdraw). No tiene decoradores.

**Entidad ORM (AccountOrmEntity):** Es solo un esquema de base de datos. Tiene decoradores @Entity().

**El Mapper:** Es el traductor. Evita que los detalles de la base de datos (como si un campo se llama owner_id o ownerId) contaminen tu lógica de negocio.

**Data Source:** Usaremos TypeORM, que es el estándar de oro en NestJS para bases de datos SQL.

---

## Hito 6: Testing Unitario Senior (Jest & Mocks)
**Concepto Teórico: El Aislamiento en las Pruebas**
Según nuestro Manifiesto de Arquitectura y el Documento de Testing, los tests unitarios son la base de la pirámide (60-70%).

**¿Qué testeamos?:** No testeamos TypeORM ni NestJS (ellos ya tienen sus propios tests). Testeamos NUESTRA lógica: el WithdrawMoneyService y la entidad Account.

**Mocks con jest.fn():** En un test unitario, está prohibido tocar la base de datos (incluso SQLite). Usamos "dobles de prueba" (Mocks) para simular el comportamiento del repositorio.

**Patrón AAA (Arrange, Act, Assert):**

- **Arrange:** Preparamos el escenario (creamos una cuenta mock).
- **Act:** Ejecutamos la acción (llamamos al método execute del servicio).
- **Assert:** Verificamos el resultado (¿el balance bajó?, ¿se llamó al método .save()?).

---

## Hito 7: Microservicios y Comunicación Asíncrona (Kafka)
**Concepto Teórico: Event-Driven Architecture (EDA)**
Según nuestro documento de Microservicios y Escalabilidad, cuando un sistema crece, pasamos de llamadas directas a Eventos.

**Core vs. Notificaciones:** Imagina que cada vez que alguien retira dinero, queremos enviar un email. Si el servicio de email cae, no queremos que el retiro falle.

**Productores y Consumidores:**
* El microservicio de Accounts será el Productor: publicará un evento llamado `money.withdrawn`.
* El microservicio de Notifications será el Consumidor: escuchará ese evento y enviará el aviso.

**Kafka como Message Broker:** Es el estándar de oro para alta concurrencia. Kafka guarda los eventos en un log, permitiendo que si un servicio se apaga, al encenderse pueda procesar lo que tiene pendiente (resiliencia).