# User Module

This module provides user management functionality for the dev.to clone application.

## Structure

```
src/user/
├── dto/                 # Data Transfer Objects
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/            # Entity definitions
│   └── user.entity.ts
├── schemas/             # Schema definitions
│   └── user.schema.ts
├── user.controller.ts   # Controller with API endpoints
├── user.service.ts      # Business logic
├── user.module.ts       # Module configuration
├── index.ts            # Module exports
└── README.md           # This file
```

## API Endpoints

### Create User

- **POST** `/users`
- **Body**: `CreateUserDto`
- **Response**: `UserEntity`

### Get All Users

- **GET** `/users`
- **Response**: `UserEntity[]`

### Search Users

- **GET** `/users/search?email=user@example.com`
- **GET** `/users/search?username=johndoe`
- **Response**: `UserEntity` or error message

### Get User by ID

- **GET** `/users/:id`
- **Response**: `UserEntity`

### Update User

- **PATCH** `/users/:id`
- **Body**: `UpdateUserDto`
- **Response**: `UserEntity`

### Delete User

- **DELETE** `/users/:id`
- **Response**: Success message

## Features

- ✅ Password hashing using Argon2
- ✅ Email and username uniqueness validation
- ✅ Comprehensive error handling
- ✅ Swagger documentation
- ✅ Input validation with class-validator
- ✅ Prisma integration for database operations

## Dependencies

- `@nestjs/common` - Core NestJS functionality
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `@prisma/client` - Database client
- `../common/prisma` - Prisma service
- `../common/hashing` - Password hashing service

## Usage

The UserModule is automatically imported in the main AppModule. All endpoints are available at `/users` base path.

### Example Usage

```typescript
// Create a new user
const newUser = await userService.create({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'password123',
  bio: 'Software developer',
  image: 'https://example.com/avatar.jpg',
});

// Find user by email
const user = await userService.findByEmail('user@example.com');

// Update user
const updatedUser = await userService.update(1, {
  bio: 'Updated bio',
});
```
