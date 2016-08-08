module.exports = function(config) {
  //load dependencies
  var download = require('download-file'),
    unzip = require('unzip'),
    fs = require('fs-extra'),
    Mustache = require('mustache')
    FTP = require('ftp-get')

  //get FTP credentials
  var ftpAuth = {
    username: process.env.FTPUSERNAME, 
    password: process.env.FTPPASSWORD
  }


  console.log('Downloading dataset from ' + config.url)

  //check if HTTP or FTP
  if(config.url.indexOf('http') > -1) {
    return getHTTP(config);
  } else if (config.url.indexOf('ftp') > -1) {
    return getFTP(config);
  }
      

 
  function getHTTP(config) {
    return new Promise(
      function(resolve, reject) {
          

          var options = {
            directory: config.writePath,
            filename: config.saveFile
          }
          download(config.url, options, function(err){
          if (err) throw err

          console.log('Saved file to ' + config.writePath + '/' + config.saveFile)
          var ext = getExtension(config.saveFile);
          if (ext=='zip') {

            console.log('Unzipping ' + config.writePath + '/' + config.saveFile)
            var stream = fs.createReadStream(config.writePath + '/' + config.saveFile)
              .pipe(unzip.Extract({ path: config.writePath }));
            
            stream.on('close', function() {
              resolve();
            })
          } else {
            resolve();
          }
        }) 
      }
    )
  }


  function getFTP(config) {
    return new Promise(
      function(resolve, reject) {

        config.url=Mustache.render(config.url, ftpAuth)
        fs.emptyDirSync(config.writePath);

        FTP.get(config.url, config.writePath + '/' + config.saveFile, function (err, res) {
          if(!err) {
            console.log('Saved file to ' + config.writePath + '/' + config.saveFile)
            var ext = getExtension(config.saveFile);
            if (ext=='zip') {
              console.log('Unzipping ' + config.writePath + '/' + config.saveFile)
              fs.createReadStream(config.writePath + '/' + config.saveFile)
                .pipe(unzip.Extract({ path: config.writePath }));
              resolve();
            } else {
              resolve();
            }
          }
        })
      }
    );
  }

  // get everything to the right of the last /... this should be the filename. But maybe not.
  function getFilename(url) {
      return url.split('/').pop();
  }

  //get file extension from filename
  function getExtension(filename) {
      return filename.split('.').pop();
  }
}
