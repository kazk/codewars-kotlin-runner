"use strict";

const fs = require('fs-extra');
const path = require('path');
const execFile = require('child_process').execFile;
const runner = require('@kazk/codewars-runner');

module.exports = runner({
  solutionOnly,
});

function solutionOnly(opts) {
  return new Promise((resolve, reject) => {
    fs.outputFileSync(path.join(opts.dir, 'main.kt'), opts.solution);
    execFile('kotlinc', ['main.kt'], {
      cwd: opts.dir,
    }, (error, stdout, stderr) => {
      if (error) return reject(Object.assign(error, {stdout, stderr}));
      resolve({
        name: 'kotlin',
        args: ['MainKt'],
        options: {
          cwd: opts.dir
        }
      });
    });
  });
}
