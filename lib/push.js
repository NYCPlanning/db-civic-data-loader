require('dotenv').config();
Mustache = require('mustache');

var child = require('child_process')

function execute(command) {
  return child.execSync(command, {stdio:[0,1,2]})
}


module.exports = function(config) {
  console.log('Pushing into database using ' + config.load + ' method...');

  return new Promise(
    function(resolve, reject) {
      
      //shp2pgsql method
      if(config.load == 'shp2pgsql') {
        

        //recursive function to run through the loadfiles one by one
        var loadFiles = config.loadFiles;

        var i=0;
        (function push(i) {
          if(i < loadFiles.length) {
      
            var command = Mustache.render('shp2pgsql {{{options}}} {{{filePath}}} {{table}} | psql {{{DATABASE_URL}}}', {
              options: config.shp2pgsql.join(' '),
              filePath: './temp/' + config.dataset + '/' + loadFiles[i].file,
              DATABASE_URL: process.env.DATABASE_URL,
              table: loadFiles[i].table
            })

            execute(command)
  
            i++;
            (i==loadFiles.length) ? resolve() : push(i); 
          }
        })(0);
      }

        //csv method
        if(config.load == 'csv') {

          //recursive function to run through the loadfiles one by one
          var loadFiles = config.loadFiles;

          var i=0;
          (function push(i) {
            if(i < loadFiles.length) {
              var filePath = './temp/' + config.dataset + '/' + loadFiles[i].file

              //execute create.sql and copy.sql
              config.csv.forEach(function(file) {
                console.log('Executing ' + file + '.sql');
                if(file == 'create') {
                  var command = Mustache.render('psql {{{DATABASE_URL}}} -f {{{path}}}{{file}}.sql', {
                    DATABASE_URL: process.env.DATABASE_URL,
                    path: config.dataset_directory + '/' + config.dataset + '/', 
                    file: file
                  });

                  var response = execute(command)
                  console.log('Done')
                }

                if(file == 'copy') {
                  var command = Mustache.render('psql {{{DATABASE_URL}}} -c "\\COPY {{dataset}} FROM \'{{{filePath}}}\' CSV HEADER;"', {
                    DATABASE_URL: process.env.DATABASE_URL,
                    path: 'datasets/' + config.dataset + '/',
                    filePath: filePath,
                    dataset: config.dataset
                  });

                  var response = execute(command)
                  console.log('Done')
                }
              });
              i++;
              (i==loadFiles.length) ? resolve() : push(i);
            }
          })(0);
        }

        //ogr2ogr method
        
        if(config.load == 'ogr2ogr') {

          //recursive function to run through the loadfiles one by one
          var loadFiles = config.loadFiles;

          var i=0;
          (function push(i) {
            console.log(i);
            if(i < loadFiles.length) {
              var filePath = './temp/' + config.dataset + '/' + loadFiles[i].file

              var command = Mustache.render('ogr2ogr {{options}} "PostgreSQL" PG:"{{{DATABASE_URL}}}" {{{filePath}}} -nln {{table}}',{
                options: config.ogr2ogr.join(' '),
                filePath: filePath,
                DATABASE_URL: process.env.DATABASE_URL,
                table: loadFiles[i].table
              });
                
              execute(command)
                  i++;
                  (i==loadFiles.length) ? resolve() : push(i);
            
            }
          })(0);
        }
      }
    )
}
