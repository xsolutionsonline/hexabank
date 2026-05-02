# Changelog - Hexabank

Este archivo documenta el progreso del desarrollo de la API de Hexabank utilizando Arquitectura Hexagonal y NestJS.

## Requisitos Previos e Instalación
Para llegar al estado actual de este proyecto desde cero, se ejecutaron los siguientes comandos:

```bash
# 1. Instalar la CLI de NestJS globalmente (si no la tienes)
npm i -g @nestjs/cli

# 2. Crear el proyecto base
nest new hexabank

# 3. Entrar a la carpeta del proyecto
cd hexabank

# 4. Instalar librerías de validación
npm install class-validator class-transformer

# 5. Instalar TypeORM y controlador de SQLite
npm install @nestjs/typeorm typeorm sqlite3
```

---

## [Unreleased] - Hitos 1 al 6 Completados

### 🎯 Hito 1: Capa de Dominio (Domain Layer)
Se estableció el núcleo de la aplicación, aislado de cualquier framework o base de datos.
- **Estructura de carpetas:** Creación del directorio `src/accounts/domain/`.
- **Entidad `Account`:** Clase de TypeScript puro con propiedades `id`, `balance`, `ownerId` y el método de negocio `withdraw(amount: number)`.
- **Puerto `AccountRepository`:** Interfaz que define los contratos de persistencia (`save`, `findById`) sin conocer detalles de infraestructura.
- **Excepciones de Dominio:** Implementación de errores específicos del negocio:
  - `AccountNotFoundException`: Lanzada cuando una cuenta no existe.
  - `InsufficientFundsException`: Lanzada por la entidad cuando se intenta retirar más dinero del disponible.

### ⚙️ Hito 2: Capa de Aplicación (Application Layer)
Se implementó la orquestación de los casos de uso.
- **Caso de Uso `WithdrawMoneyService`:** Servicio de NestJS (`@Injectable`) que coordina el retiro de dinero:
  - Inyecta el repositorio a través del token `'ACCOUNT_REPOSITORY'`.
  - Recupera la cuenta, delega la regla de negocio a la entidad (`account.withdraw`) y guarda los cambios.
  - Valida la existencia de la cuenta y lanza la excepción de dominio correspondiente.

### 🔌 Hito 3: Capa de Infraestructura (Infrastructure Layer) y Módulos
Se implementaron los adaptadores tecnológicos y la comunicación hacia el exterior.
- **Adaptador `InMemoryAccountRepository`:** Implementación en memoria de la interfaz `AccountRepository` para facilitar pruebas inmediatas (incluye una cuenta inicial `id: '123'`, `balance: 100`).
- **Controlador `AccountsController`:** Exposición del caso de uso a través de HTTP (`POST /accounts/:id/withdraw`).
  - Mapeo de excepciones de dominio a errores HTTP estándar (`404 Not Found`, `400 Bad Request`).
- **Inyección de Dependencias (`AccountsModule`):** Configuración del módulo de cuentas vinculando la interfaz (`'ACCOUNT_REPOSITORY'`) con la implementación (`InMemoryAccountRepository`).
- **Integración:** Importación de `AccountsModule` en el `AppModule` principal manteniendo un encapsulamiento estricto.
- **Testing:** Creación del archivo `api.http` en la raíz del proyecto para probar el endpoint desde clientes HTTP de IDEs.

### 🛡️ Hito 4: Contratos y Validación (DTOs & Pipes)
Se aseguró la integridad de los datos en la entrada de la aplicación.
- **DTOs (`WithdrawDto`):** Creación del contrato de datos para el retiro de dinero, utilizando decoradores (`@IsNotEmpty`, `@IsNumber`, `@IsPositive`) para definir reglas estrictas en `amount`.
- **Configuración Global de Validación (`main.ts`):** Integración de `ValidationPipe` en toda la aplicación con las reglas:
  - `whitelist: true`: Filtra propiedades no definidas en el DTO.
  - `forbidNonWhitelisted: true`: Bloquea peticiones con propiedades extras.
  - `transform: true`: Convierte automáticamente los tipos (ej. strings numéricos a numbers).
- **Integración:** Actualización de `AccountsController` para consumir el DTO oficial en lugar del contrato temporal.

### 💾 Hito 5: Persistencia Real (TypeORM y Patrón Mapper)
Se implementó la conexión a una base de datos real (SQLite) mediante TypeORM, manteniendo estricta separación con el Dominio.
- **Entidad ORM (`AccountOrmEntity`):** Entidad de infraestructura exclusiva para TypeORM (`@Entity('accounts')`) sin lógica de negocio.
- **Mapper (`AccountMapper`):** Clase de transformación bidireccional entre la entidad del ORM y la entidad de Dominio (`toDomain`, `toOrm`).
- **Adaptador Real (`TypeOrmAccountRepository`):** Nueva implementación de la interfaz `AccountRepository` usando el `Repository` nativo de TypeORM, inyectado mediante `@InjectRepository(AccountOrmEntity)`.

### 🧪 Hito 6: Testing Unitario Senior (Jest & Mocks)
Se implementaron pruebas automatizadas independientes y confiables que garantizan la calidad del código mediante el uso del patrón AAA (Arrange, Act, Assert).
- **Mocks Completos:** Uso de `jest.fn()` para simular el comportamiento del repositorio de cuentas (`findById`, `save`) e inyectarlo en el entorno de pruebas de NestJS usando el token `'ACCOUNT_REPOSITORY'`.
- **Caso de Éxito (Success Case):** Verificación estricta de que el servicio de retiro (WithdrawMoneyService) busque la cuenta adecuada, modifique el balance correctamente en memoria y asegure de llamar a `.save()` en el repositorio mock.
- **Caso de Error (Failure Case):** Garantizar que si no se encuentra la cuenta, el sistema lance la excepción apropiada (`AccountNotFoundException`) y se compruebe que no se realice ningún llamado a `.save()`.

---
*Próximos pasos: Hito 7 (Microservicios y Kafka).*