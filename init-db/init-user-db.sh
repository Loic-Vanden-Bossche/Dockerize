#!/bin/bash
set -e

psql ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER user with encrypted password 'usr_armen';
    GRANT ALL PRIVILEGES ON DATABASE armen TO usr_armen;
    ALTER ROLE usr_armen SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN;
    ALTER DATABASE armen OWNER TO usr_armen;

    CREATE USER armen with encrypted password 'armen';
    GRANT ALL PRIVILEGES ON DATABASE armen TO armen;
    ALTER DATABASE armen OWNER TO armen;
EOSQL