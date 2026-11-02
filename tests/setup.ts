import '@testing-library/jest-dom';

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres_password@localhost:5433/sahayak_db?sslmode=disable';
process.env.APP_MASTER_KEY =
  process.env.APP_MASTER_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.APP_MASTER_ENCRYPTION_KEY =
  process.env.APP_MASTER_ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.PSEUDO_SALT =
  process.env.PSEUDO_SALT ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.EMAIL_LOOKUP_PEPPER =
  process.env.EMAIL_LOOKUP_PEPPER ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
