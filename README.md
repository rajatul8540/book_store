# Laravel + React JWT Books CRUD

This project is built with Laravel API, React frontend, MySQL, JWT authentication, and Books CRUD.

## Installation Steps

```bash
composer install
export books.sql  
# 
npm install  # if it faill then use   npm install --legacy-peer-deps
cp .env.example .env
php artisan key:generate
```

Set API URL in `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Run backend:

```bash
php artisan serve
```

Run React/Vite:

```bash
npm run dev
```

Build React assets:

```bash
npm run build
```

## DB Setup

Create MySQL database:

```sql
CREATE DATABASE store;
```

Update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=store
DB_USERNAME=root
DB_PASSWORD=
```

Run Laravel migrations:

```bash
php artisan migrate
```

Create storage link for book cover images:

```bash
php artisan storage:link
```

Main tables:

```txt
users
books
```

Books fields:

```txt
id, title, author, cover_image, price, published_date, _deleted
```

## JWT Setup

JWT package:

```txt
php-open-source-saver/jwt-auth
```

Generate JWT secret if needed:

```bash
php artisan jwt:secret
```

Protected APIs require this header:

```http
Authorization: Bearer <token>
```

## API Documentation

Base URL:

```txt
http://127.0.0.1:8000/api
```

Common response format:

```json
{
  "status": true,
  "message": "Success message",
  "value": {}
}
```

### Auth APIs

Register:

```http
POST /auth/register
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

Login:

```http
POST /auth/login
```

Body:

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

Profile:

```http
GET /auth/profile
Authorization: Bearer <token>
```

Logout:

```http
POST /logout
Authorization: Bearer <token>
```

### Books APIs

All books APIs require JWT token.

Add book:

```http
POST /books
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form data:

```txt
title
author
cover_image
price
published_date
```

List books:

```http
GET /books?search=&page=1&per_page=10
Authorization: Bearer <token>
```

Fetch one:

```http
GET /books/{id}
Authorization: Bearer <token>
```

Update:

```http
PUT /books/{id}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Delete:

```http
DELETE /books/{id}
Authorization: Bearer <token>
```

Delete is soft delete:

```txt
_deleted = 1
```

## Postman Collection

Create Postman environment:

```txt
base_url = http://127.0.0.1:8000/api
token = paste_login_token_here
```

Requests:

```txt
POST   {{base_url}}/auth/register
POST   {{base_url}}/auth/login
GET    {{base_url}}/auth/profile
POST   {{base_url}}/logout
POST   {{base_url}}/books
GET    {{base_url}}/books?search=&page=1&per_page=10
POST /books/1
+ _method = PUTDELETE {{base_url}}/books/1
```

For protected APIs, add header:

```http
Authorization: Bearer {{token}}
```

For `POST /books` and `PUT /books/{id}`, use `form-data`. Set `cover_image` type as `File`.
