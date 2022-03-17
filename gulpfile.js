var gulp = require('gulp');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var setup = require('./gulp/setup.js');

// CONFIG
// ==============================
const tsProject = ts.createProject('tsconfig.json');
const configFiles = ['./install-script.sh', './package.json'];

function checkCode() {
  var tsResult = tsProject.src().pipe(tsProject());

  return tsResult;
}

function lint() {
  return tsProject
    .src()
    .pipe(
      tslint({
        configuration: 'tslint.json',
        formatter: 'verbose'
      })
    )
    .pipe(
      tslint.report({
        emitError: false
      })
    );
}

/**
 * Builds each of the ts files into JS files in the output folder
 */
exports.tsCheckCode = checkCode;

/**
 * Ensures the code quality is up to scratch
 */
exports.tslint = lint;

exports.bumpPatch = function() {
  return setup.bumpVersion(setup.bumpPatchNum, configFiles);
};
exports.bumpMinor = function() {
  return setup.bumpVersion(setup.bumpMidNum, configFiles);
};
exports.bumpMajor = function() {
  return setup.bumpVersion(setup.bumpMajorNum, configFiles);
};
exports.build = gulp.series(checkCode, lint);
