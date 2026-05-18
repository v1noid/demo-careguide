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
