# Changelog - Hexabank

Este archivo documenta el progreso del desarrollo de la API de Hexabank utilizando Arquitectura Hexagonal y NestJS.

## [Unreleased] - Hitos 1, 2 y 3 Completados

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

---
*Próximos pasos: Hito 4 (Validación con DTOs y Pipes).*