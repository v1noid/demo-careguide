## Start The App

From the root folder, install all dependencies first:

```bash
npm run install:all
```

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Update `server/.env` with your MongoDB connection string and JWT secret:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/secure_notes
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:3000
```

Optionally seed the first admin user:

```bash
cd server
npm run seed:admin
cd ..
```

Run both the server and client:

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

## Backend Routes

Use JWT auth with this header for protected routes:

```http
Authorization: Bearer <token>
```

List routes support pagination with:

```txt
?page=1&limit=10
```

### Health

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API health check. |

### Auth

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register a normal `user` account. |
| `POST` | `/api/auth/login` | Public | Login and receive a JWT. |
| `GET` | `/api/auth/me` | User/Admin | Return the current DB-backed user profile. |

Register body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "interests": ["reading", "chess"]
}
```

Login body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Notes

Users can create, update, delete, and list their own notes. Admins inherit those same own-note capabilities and can also view everyone's notes with `scope=all`.

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/notes?page=1&limit=10` | User/Admin | List the signed-in user's own notes. |
| `GET` | `/api/notes?scope=all&page=1&limit=10` | Admin | List everyone's notes. |
| `POST` | `/api/notes` | User/Admin | Create a note owned by the signed-in user. |
| `GET` | `/api/notes/:id` | Owner/Admin | View a specific note. |
| `PATCH` | `/api/notes/:id` | Owner only | Update a note. |
| `DELETE` | `/api/notes/:id` | Owner only | Delete a note. |

Create/update body:

```json
{
  "title": "Meeting notes",
  "content": "Discuss API routes and indexes."
}
```

### Admin User Management

Admin routes fetch the current user from MongoDB and require `role === "admin"`.

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users?page=1&limit=10` | Admin | List all users. |
| `POST` | `/api/users` | Admin | Add a user or admin. |
| `GET` | `/api/users/:id` | Admin | Get one user. |
| `PATCH` | `/api/users/:id` | Admin | Update a user. |
| `DELETE` | `/api/users/:id` | Admin | Remove a user. Admins cannot delete themselves. |

Create/update body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "interests": ["mongodb", "security"]
}
```

### Aggregations

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users/grouped-by-interests?page=1&limit=10` | Admin | Uses exactly one `User.aggregate()` call to group users by interests. |
| `GET` | `/api/users/:id/posts?page=1&limit=10` | Public | Uses one aggregation pipeline with `$lookup` to retrieve posts for a user. |

Grouped interests response shape:

```json
{
  "data": [
    {
      "interest": "chess",
      "userCount": 2,
      "users": [
        { "id": "userId", "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

User posts lookup response shape:

```json
{
  "user": {
    "id": "userId",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "interests": ["reading"]
  },
  "data": [
    {
      "_id": "postId",
      "author": "userId",
      "title": "Public post",
      "content": "Post content"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

### Posts

Posts are stored separately from notes and are visible to everyone.

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/posts?page=1&limit=10` | Public | List posts. |
| `POST` | `/api/posts` | User/Admin | Create a post for the signed-in user. |

Create body:

```json
{
  "title": "Public post",
  "content": "This post is visible to everyone."
}
```

## Useful Commands

Run only the server:

```bash
npm run dev:server
```

Run only the client:

```bash
npm run dev:client
```

Build the server:

```bash
cd server
npm run build
```

Build the client:

```bash
cd client
npm run build
```
