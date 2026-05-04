-- La DB 'hexabank_local' se crea por la variable POSTGRES_DB
-- Aquí creamos la de desarrollo:
-- Por si acaso, creamos ambas explícitamente
SELECT 'CREATE DATABASE hexabank_local' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hexabank_local')\gexec
SELECT 'CREATE DATABASE hexabank_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hexabank_dev')\gexec