/* Import needed libraries */
var gulp       = require('gulp'),
    coffee     = require('gulp-coffee'),
    coffeelint = require('gulp-coffeelint'),
    gutil      = require('gulp-util'),
    shell      = require('gulp-shell'),
    jasmine    = require('gulp-jasmine'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    clean      = require('gulp-clean'),
    rename     = require('gulp-rename');

/* Config of the tasks */
var output_dir = './dist';  // Default : the current directory
var coffee_dir = './coffee' // Configure your CoffeeScript directory
var js_dir = './js';        // Configure your JavaScript directory
var file_name = 'app';      // Make sure you're not adding an extension

/* CoffeeScript configuration */
var bare = true;
var coffeelint_config = './coffeelint.json';

/* Test configuration */
var test_runner = './test/test.js'; // Put your testrunner file here
var verbose = false;

/* Delete the old .js generated files */
gulp.task('clean', function() {

   return gulp.src(js_dir + '/*').
      pipe(clean());

});

/* Lint the .coffee files */
gulp.task('coffeelint', function () {

   return gulp.src(coffee_dir + '/**/*.coffee')
      .pipe(coffeelint(coffeelint_config))
      .pipe(coffeelint.reporter());

});

/* Convert CoffeeScript to JavaScript */
gulp.task('coffee', ['clean'], function() {

   return gulp.src(coffee_dir + '/**/*.coffee')
      .pipe(coffee({
         bare : bare,
      })).on('error', handleError) // Handler coffee script error
      .pipe(gulp.dest(js_dir + '/'));

});

/* Concat .js files into on file */
gulp.task('concat', ['coffee'], function () {

   return gulp.src(js_dir + '/**/*.js')
      .pipe(concat(file_name + '.js'))
      .pipe(gulp.dest(output_dir));

});

/* Concat .coffee files into on file */
gulp.task('concat-coffee', ['coffee'], function () {

   return gulp.src(coffee_dir + '/**/*.coffee')
      .pipe(concat(file_name + '.coffee'))
      .pipe(gulp.dest(output_dir));

});

/* Run a debbuger for the application */
gulp.task('debug', ['concat-coffee'], function() {

   gutil.log(gutil.colors.yellow.bold('****** Starting the Debugger *****'));
   console.log('\n\n');

   return gulp.src(output_dir + '/' + file_name + '.coffee')
      .pipe(shell([
         'coffee --nodejs --debug <%= file.path %>'
      ])).on('finish', function() {
         console.log('\n\n');
         gutil.log(gutil.colors.yellow.bold('******** Kill the Debugger *******'));
      });

});

/* Dev task : run the tests with jasmine */
gulp.task('test', function() {

   return gulp.src(test_runner)
      .pipe(jasmine({
         verbose: verbose,
         includeStackTrace: verbose
      }));

});

/* Minify the concated file */
gulp.task('min', ['concat'], function () {
  
   return gulp.src(output_dir + '/' + file_name + '.js')
      .pipe(uglify())
      .pipe(rename(file_name + '.min.js'))
      .pipe(gulp.dest(output_dir));

});

/* Run Gulp (by default do all the tasks */
gulp.task('default', ['coffeelint', 'min'],  function() {
   gutil.log('Placing the output in ' + output_dir)
   gutil.log('Done generating ' + file_name + '.min.js file ...');
});

/* Dev task : auto compile file when changes are detected */
gulp.task('watch', function() {
   gulp.watch(coffee_dir + '/**/*.coffee', ['concat']).on('change', handleFileChanging);
});

/* Dev task : auto compile & minify file when changes are detected */
gulp.task('watch-min', function() {
   gulp.watch(coffee_dir + '/**/*.coffee', ['min']).on('change', handleFileChanging);
});

/* Handle file changing */
function handleFileChanging (event) {
   gutil.log('File changet at ' + gutil.colors.magenta(event.path));
}

/* Primary function of error handling */
function handleError (error) {
   /* Slit the stack */
   stack = error.stack.split('\n');
   for (s in stack) {
      /* Print it in red */
      gutil.log(gutil.colors.red(stack[s]))
   }
   /* End the task */
   this.emit('end');
}
