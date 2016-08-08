DROP TABLE IF EXISTS mta_busstops;
CREATE TABLE mta_busstops AS 
SELECT * FROM manhattanstops
UNION ALL
SELECT * FROM bronxstops
UNION ALL
SELECT * FROM queensstops
UNION ALL
SELECT * FROM brooklynstops
UNION ALL
SELECT * FROM statenislandstops
UNION ALL
SELECT * FROM buscostops;

DROP TABLE manhattanstops;
DROP TABLE bronxstops;
DROP TABLE brooklynstops;
DROP TABLE statenislandstops;
DROP TABLE buscostops;

ALTER TABLE mta_busstops RENAME COLUMN wkb_geometry TO geom;