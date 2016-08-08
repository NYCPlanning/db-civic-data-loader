module.exports = function(dataset) {
  var Mustache = require('mustache')
  var db = require('./dbconfig.js')
  var exec = require('child_process').exec
  var fs = require('fs')


  console.log('Checking for after file...')

  fs.open('datasets/' + dataset + '/after.sql', 'r', function(err) {
    if(err) {
      console.log('No after.sql found.')
    } else {
      runCommand();
    }
  })
  
  function runCommand() {
    var command = Mustache.render('psql -d {{database}} -U {{user}} -f {{{path}}}after.sql', {
      user: db.user,
      database: db.database,
      path: 'datasets/' + dataset + '/'
    });

    console.log(command);


  }
  
}
