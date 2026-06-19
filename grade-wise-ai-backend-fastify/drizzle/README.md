# Migrations

Run against PostgreSQL with pgvector enabled:

```bash
npm run db:migrate
```

For local bootstrap without migration history, `init-pgvector.sql` runs via Docker Compose.

Use `npm run db:generate` after schema changes, commit the generated SQL, then `npm run db:migrate` in CI/production.
