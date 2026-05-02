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