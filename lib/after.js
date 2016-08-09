module.exports = function(dataset) {
  var Mustache = require('mustache')
  var db = require('./dbconfig.js')
  var exec = require('child_process').exec
  var fs = require('fs')


  console.log('Checking for after file...')

  fs.open(config.dataset_directory + '/' + config.dataset + '/after.sql', 'r', function(err) {
    if(err) {
      console.log('No after.sql found.')
    } else {
      runCommand();
    }
  })
  
  function runCommand() {
    var command = Mustache.render('psql -d {{{DATABASE_URL}}} -f {{{path}}}after.sql', {
      DATABASE_URL: process.env.DATABASE_URL,
      path: config.dataset_directory + '/' + config.dataset + '/'
    });

    console.log(command);


  }
  
}
