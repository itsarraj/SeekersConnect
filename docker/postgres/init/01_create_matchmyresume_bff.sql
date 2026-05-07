-- Second logical database for matchmyresume-bff (POSTGRES_DB defaults to `uas`).
-- Runs only on first container init (empty data volume).
CREATE DATABASE matchmyresume_bff OWNER seekers;
