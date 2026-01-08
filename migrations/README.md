# Database Migrations

## Quick Setup (Run SQL directly)

If you haven't created the database tables yet, you need to run the SQL script on your PostgreSQL database.

### Option 1: Using psql (Command Line)

```bash
psql $DATABASE_URL -f migrations/create_tables.sql
```

### Option 2: Using a Database GUI

1. Connect to your PostgreSQL database (the one specified in `DATABASE_URL`)
2. Open the SQL script: `migrations/create_tables.sql`
3. Run the entire script

### Option 3: Using Vercel Postgres Dashboard

1. Go to your Vercel dashboard
2. Navigate to your project → Storage → Postgres
3. Click on "Query" or "SQL Editor"
4. Copy and paste the contents of `migrations/create_tables.sql`
5. Execute the query

## Using Drizzle Kit (Recommended for future migrations)

### Generate a migration

```bash
npm run db:generate
```

This will create migration files in the `migrations/` directory based on your schema changes.

### Apply migrations

```bash
npm run db:migrate
```

### Push schema directly (for development)

```bash
npm run db:push
```

This will sync your schema directly to the database without creating migration files.

## Tables Created

The migration script creates the following tables:

1. **users** - Stores user information (required for Replit Auth)
2. **expenses** - Stores expense records
3. **sessions** - Stores session data (required for Replit Auth)

## Troubleshooting

If you get errors like:
- `relation "expenses" does not exist` - You need to run the migration
- `permission denied` - Check your database user permissions
- `connection refused` - Verify your `DATABASE_URL` environment variable

