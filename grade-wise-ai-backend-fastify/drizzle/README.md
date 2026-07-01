# Migrations

Run against PostgreSQL with pgvector enabled:

```bash
npm run db:migrate
```

For local bootstrap, run the contents of `init-pgvector.sql` once on the target DB to enable the `vector` extension.

Use `npm run db:generate` after schema changes, commit the generated SQL, then `npm run db:migrate` in CI/production.
