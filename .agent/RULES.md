# NestJS Backend Architecture Rules

## Architecture Style

This project uses:

- Feature Driven Architecture
- UseCase Driven Structure
- 1 File = 1 Concern principle
- Clean Architecture inspired layering

The codebase must remain:

- scalable
- modular
- maintainable
- testable
- consistent

---

# Core Principles

## 1 File = 1 Concern

Each file must have only one responsibility.

Examples:

- One controller per use-case
- One DTO per use-case
- One validator per use-case
- One response formatter per use-case

Avoid multi-purpose files.

---

# Feature Driven Structure

All business domains must live inside:

```txt
src/modules/
```

Example:

```txt
src/modules/auth
src/modules/users
src/modules/berita
src/modules/fakultas
```

Never organize by technical layer globally.

Avoid:

```txt
src/controllers
src/services
src/repositories
```

Use feature grouping instead.

---

# Standard Feature Structure

Every feature must follow this structure:

```txt
feature/
├── use-cases/
├── repositories/
├── entities/
├── services/
├── interfaces/
├── guards/
├── constants/
├── utils/
└── feature.module.ts
```

---

# Use Case Driven Structure

Every business action must have its own folder.

Example:

```txt
use-cases/
├── login/
├── register/
├── refresh-token/
└── forgot-password/
```

---

# Standard Use Case Structure

Each use-case folder should contain:

```txt
create-user/
├── create-user.controller.ts
├── create-user.use-case.ts
├── create-user.dto.ts
├── create-user.response.ts
├── create-user.validator.ts
```

Optional:

```txt
├── create-user.mapper.ts
├── create-user.presenter.ts
├── create-user.policy.ts
```

---

# Controller Rules

Controllers must:

- Handle HTTP request/response only
- Validate incoming requests
- Call use-case
- Return formatted response

Controllers must NOT:

- Contain business logic
- Access database directly
- Hash passwords
- Generate tokens
- Contain validation logic
- Become massive files

Controllers should stay thin.

---

# Use Case Rules

Use-cases contain business logic.

Rules:

- Must expose `execute()` method
- Must follow single responsibility principle
- Must not contain HTTP-specific logic
- Must not know Express/Nest request objects directly

Example:

```ts
export class CreateUserUseCase {
  async execute(dto: CreateUserDto) {}
}
```

---

# Repository Rules

Repositories are responsible for:

- database access
- queries
- persistence

Repositories must NOT:

- contain business rules
- contain HTTP logic
- contain response formatting

---

# Service Rules

Services are reusable utilities/helpers.

Examples:

- JWT service
- Password hashing service
- OTP service
- Mail service
- File upload service

Services must NOT become God Objects.

Avoid massive service files.

---

# DTO Rules

DTOs must:

- validate input
- use `class-validator`
- represent request payloads only

One DTO per use-case.

Example:

```txt
login.dto.ts
create-user.dto.ts
update-user.dto.ts
```

---

# Response Rules

Responses should be standardized.

Use:

- response classes
- presenters
- serializers

Avoid returning raw entities directly.

---

# Validator Rules

Complex validation must be separated.

Example:

```txt
create-user.validator.ts
```

Do not overload DTOs with heavy business validation.

---

# Naming Convention

Use:

- kebab-case
- suffix naming

Examples:

```txt
create-user.use-case.ts
login.dto.ts
auth.controller.ts
user.repository.ts
```

Avoid:

```txt
CreateUser.ts
userService.ts
LOGINDTO.ts
```

---

# Dependency Flow

Allowed flow:

```txt
Controller
→ Use Case
→ Repository
→ Database
```

Alternative:

```txt
Controller
→ Service
→ External Provider
```

Avoid:

```txt
Controller → Database
Repository → Controller
Circular dependency
```

---

# Module Rules

Each feature must have its own module.

Example:

```txt
auth.module.ts
users.module.ts
berita.module.ts
```

Modules should encapsulate their domain.

---

# Common Folder Rules

Shared reusable logic belongs inside:

```txt
src/common/
```

Examples:

```txt
common/
├── decorators/
├── filters/
├── interceptors/
├── exceptions/
├── guards/
└── utils/
```

Do not place business-specific logic inside common.

---

# Infrastructure Rules

Infrastructure-related code belongs inside:

```txt
src/infrastructure/
```

Examples:

```txt
infrastructure/
├── prisma/
├── database/
├── cache/
├── queue/
└── storage/
```

---

# Clean Code Rules

Always:

- prefer composition over inheritance
- keep functions small
- use explicit naming
- avoid magic values
- separate concerns aggressively
- write readable code

Avoid:

- massive files
- nested logic hell
- duplicated business logic
- generic utility dumping grounds

---

# Scalability Rules

Generated code must be:

- modular
- testable
- reusable
- easy to refactor
- easy to extend

Architecture consistency is mandatory.

---

# AI Assistant Rules

When generating new features:

- automatically create use-case structure
- separate controller, dto, validator, response, and use-case
- never place multiple business actions in one file
- never create fat controllers
- never create fat services
- follow existing architecture consistently

Always prioritize maintainability over short code.
