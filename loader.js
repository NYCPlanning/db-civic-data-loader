var fs=require('fs');

var Get = require('./lib/get.js');
var Push = require('./lib/push.js');

//get the command that the user passed in
var command = process.argv[2];

//get the name of the dataset that the user passed in
var dataset = process.argv[3];

//make sure the dataset config exists
var open_datasets = fs.readdirSync('./open_datasets');
var other_datasets = fs.readdirSync('./other_datasets');

var dataset_directory = (open_datasets.indexOf(dataset) > -1) ? 'open_datasets' : 
  (other_datasets.indexOf(dataset) > -1) ? 'other_datasets' : null


if(dataset_directory) {

var dirPath = './' + dataset_directory + '/' + dataset;

//get the configuration for this dataset from its data.json file
var config = require(dirPath + '/data.json')

//use defined saveFile name or use the URL
config.saveFile = config.saveFile || getFilename(config.url);
config.writePath = './temp/' + dataset;
config.dataset = dataset;
config.dataset_directory = dataset_directory;

  //install == get + push
  if (command=='install') {
    Get(config)
      .then(function(){
        Push(config);
      });
  }

  //get == just download file
  if (command=='get') {
    Get(config);
  }

  //push == just load into db
  if (command=='push') {
    Push(config)
      .then(function(){
        console.log('Done')
      })
  }
} else {
  console.log('Error: Could not find a dataset config with that name')
}

// get everything to the right of the last /... this should be the filename. But maybe not.
function getFilename(url) {
    return url.split('/').pop();
}
