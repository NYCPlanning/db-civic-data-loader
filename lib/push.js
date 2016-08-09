require('dotenv').config();


var c = require('child_process');

module.exports = function(config) {
  return new Promise(
      function(resolve, reject) {
        //load dependencies
        var Mustache = require('mustache'),
          exec = require('child_process').exec;

        //shp2pgsql method
        if(config.load == 'shp2pgsql') {
          console.log('Pushing into database using ' + config.load + '...');

          //recursive function to run through the loadfiles one by one
          var loadFiles = config.loadFiles;

          var i=0;
          (function push(i) {
            console.log(i);
            if(i < loadFiles.length) {
              var filePath = './temp/' + config.dataset + '/' + loadFiles[i].file


              var shp2pgsql = Mustache.render('shp2pgsql {{{options}}} {{{filePath}}} {{table}} | psql {{{DATABASE_URL}}}', {
                options: config.shp2pgsql.join(' '),
                filePath: filePath,
                DATABASE_URL: process.env.DATABASE_URL,
                table: loadFiles[i].table
              })

              console.log('Executing: ' + shp2pgsql);
              var child = require('child_process').exec(shp2pgsql)
                  
              child.stdout.pipe(process.stdout)
              child.on('close', function() {
    
                i++;
                if(i==loadFiles.length) {
                  console.log('finished loading all files')
                  resolve()
                } else {
                  console.log('Finished file ' + i )
                  push(i);
                } 
              })
            }
          })(0);
        }

        //csv method
        if(config.load == 'csv') {
          console.log('Pushing into database using ' + config.load + '...');

          //recursive function to run through the loadfiles one by one
          var loadFiles = config.loadFiles;

          var i=0;
          (function push(i) {
            console.log(i);
            if(i < loadFiles.length) {
              var filePath = './temp/' + config.dataset + '/' + loadFiles[i].file

              config.csv.forEach(function(file) {
                console.log(file);
                if(file == 'create') {
                  var command = Mustache.render('psql {{{DATABASE_URL}}} -f {{{path}}}{{file}}.sql', {
                    DATABASE_URL: process.env.DATABASE_URL,
                    path: config.dataset_directory + '/' + config.dataset + '/', 
                    file: file
                  });

                  console.log('Executing psql: ' + command)

                  var response = c.execSync(command)
                  console.log('Done', response)
            
                }

                if(file == 'copy') {
                  var loadFile = loadFiles[i].file;


                  var command = Mustache.render('psql -d {{database}} -U {{user}} -c "\\COPY {{dataset}} FROM \'{{{filePath}}}\' CSV HEADER;"', {
                    user: db.user,
                    database: db.database,
                    path: 'datasets/' + dataset + '/',
                    filePath: filePath,
                    dataset: dataset
                  });

                  console.log('Executing psql: ' + command)

                  var response = c.execSync(command)
                  console.log('Done', response)


                }
        
              });
              i++;
              (i==loadFiles.length) ? resolve() : push(i);
            }
          })(0);
        }

        //ogr2ogr method
        
        if(config.load == 'ogr2ogr') {
          console.log('Pushing into database using ' + config.load + '...');

          //recursive function to run through the loadfiles one by one
          var loadFiles = config.loadFiles;

          var i=0;
          (function push(i) {
            console.log(i);
            if(i < loadFiles.length) {
              var filePath = './temp/' + config.dataset + '/' + loadFiles[i].file

              var ogr2ogr = Mustache.render('ogr2ogr {{options}} "PostgreSQL" PG:"{{{DATABASE_URL}}}" {{{filePath}}} -nln {{table}}',{
                options: config.ogr2ogr.join(' '),
                filePath: filePath,
                DATABASE_URL: process.env.DATABASE_URL,
                table: loadFiles[i].table
              });
                
              console.log('Executing: ' + ogr2ogr);
              exec(ogr2ogr, {}, function(err, stdout, stderr) {
                  console.log(stdout);
                  i++;
                  (i==loadFiles.length) ? resolve() : push(i);
              })
            }
          })(0);
        }


      }
    )
}
