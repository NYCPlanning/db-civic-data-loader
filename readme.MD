#Civic Data Loader

A node.js CLI tool for automated dataset loading into the PostgreSQL/PostGIS, making the full refresh of a dataset as simple as `node loader install {datasetName}` Inspired by John Krauss' [docker4data](https://github.com/talos/docker4data)

##Structure

`datasetName` should be unique, and takes the form of {agency}_{dataset}, e.g. `dcp_mappluto`.  Each dataset should have a folder with its datasetName in the `open_datasets` directory.  When executing the CLI tool, the datasetName is passed in as an argument, and the script searches for `{datasetName}/data.json` and then runs accordingly.

##data.json

`data.json` includes everything the script needs to download, process, and load the dataset.  An example `data.json` for NYC borough boundaries looks like:

```
{
  "url": "http://www1.nyc.gov/assets/planning/download/zip/data-maps/open-data/nybb16b.zip",
  
  "load": "shp2pgsql",
  "loadFiles": [
    {
      "file":"nybb_16b/nybb.shp",
      "table": "dcp_boroughboundaries"
    }
  ],
  "shp2pgsql": [ 
    "-d",
    "-s 2263:4326"
  ] 
}
```
- `url` - the download link, grabbed when using the `Get` method.
- `saveFile` - optional - the name of the file to save after a Get.  (useful when the downloaded file has a generic name or does not have the correct file extension)
- `load` - which loading type to use.  `shp2pgsql`, `csv`, and `ogr2ogr` are the available options, see "Loading Types" below.
- `loadFiles` - an array of files to be loaded when using the `Push` method.  Most datasets will just have one, but some, like pluto, have a single file to download but many files to upload.  
- `shp2pgsql` - an array of arguments for the shp2pgsql command.  Only used if `load` is set to 'shp2pgsql'

##How to Use

- Clone this repo
- Install dependencies `npm install`
- Rename `.env.sample` to `.env` and enter the postgres connection string as `DATABASE_URL`:
`DATABASE_URL=postgres://user:password@host:port/database`
- Enter `node loader {command} {datasetName}` in the terminal, like `node loader install dcp_boroboundaries`
- Watch the magic happen!

##Commands

The workflows are divided into 2 parts: `get`, `push`.  

- `get` downloads the file to the temp directory and unzips if necessary
- `push` grabs the file(s) from the temp directory and loads it(them) into the database
- `install` does both `get` and `push`


##Loading Types:

`shp2pgsql` - For Shapefiles.  In the case of much of NYC's open data, a conversion from NY state plane to WGS84 is required.  (this is why the `-s 2263:4326` flag is set in the example above)

`csv` - For CSVs.  If this type is chosen, you must also provide `create.sql` and `copy.sql` in the dataset's directory.

`ogr2ogr` - Useful for loading geojson files.  File should be a geojson FeatureCollection.

##create.sql
If loading csvs, this is simply a CREATE TABLE statement that is run before loading the data.  In the future we could use ogr2ogr to do column type guessing if people want it.
```
-- create table to load csv from the nyc open data portal
DROP TABLE IF EXISTS nysopwdd_facilities_providers;
CREATE TABLE nysopwdd_facilities_providers (
  Developmental_Disability_Services_Office text,
  Service_Provider_Agency text,
  Street_Address_ text,
  Street_Address_Line_2 text,
  City text,
  State text,
  Zip_Code text,
  Phone text,
  County text,
  Website_Url text,
  Intermediate_Care_Facilities_ICFs text,
  Individual_Residential_Alternative_IRA text,
  Family_Care text,
  Consolidated_Supports_And_Services text,
  Individual_Support_Services_ISSs text,
  Day_Training text,
  Day_Treatment text,
  Senior_Geriatric_Services text,
  Day_Habilitation text,
  Work_Shop text,
  Prevocational text,
  Supported_Employment_Enrollments text,
  Community_Habilitation text,
  Family_Support_Services text,
  Care_at_Home_Waiver_Services text,
  Developmental_Centers_And_Special_Population_Services text,
  Location_1 text
  )
```
##copy.sql
If loading csvs, this is the copy statement with the source file and the destination table.
`\COPY nysopwdd_facilities_providers FROM './temp/nysopwdd_facilities_providers/nysopwdd_facilities_providers.csv' CSV HEADER;`


##Non-public data

The loader will search for a matching dataset in both the `open_datasets` and `other_datasets` directories.  `open_datasets` is included in this repo, but the contents of `other_datasets` is ignored by git, so you can use it to create loading configurations for your non-publicly accessible data.  


TODO: 
- lots of error handling
- add all the datas!
- add an "after" handler that can execute SQL after the push is successful the data have been loaded.
