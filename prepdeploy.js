var compressor = require('node-minify');
 
// Using Google Closure Compiler
compressor.minify({
  compressor: 'gcc',
  input: './public/devcenter/main.js',
  output: './public/devcenter/main.min.js',
  callback: function(err, min) {}
});