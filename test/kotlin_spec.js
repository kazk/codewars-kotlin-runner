"use strict";

const expect = require('chai').expect;
const WritableStreamBuffer = require('stream-buffers').WritableStreamBuffer;
const Docker = require('dockerode');
const docker = new Docker();

describe('Kotlin runner', function() {
  it('should handle basic code evaluation', async function() {
    const buffer = await run({
      format: 'json',
      solution: `fun main(args: Array<String>) { println(42); }`,
    });
    expect(buffer.stdout).to.equal('42\n');
    expect(buffer.exitCode).to.equal(0);
    showBuffer(buffer);
  });
});

function run(opts) {
  // shovel.js: MAX_BUFFER=1500*1024, MAX_DATA_BUFFER=50*1024
  const out = new WritableStreamBuffer({
    initialSize: 500 * 1024,
    incrementAmount: 50 * 1024
  });

  return docker.run('kazk/codewars-kotlin-runner', ['run-json', JSON.stringify(opts)], out, {
    HostConfig: {
      Sysctls: {
        "net.core.somaxconn": "65535",
      }
    }
  })
  .then(function(container) {
    container.remove();
    out.end();
    return JSON.parse(out.getContentsAsString('utf8'));
  })
  .catch(function(err) {
    console.log(err);
  });
}

function showBuffer(buffer) {
  if (buffer.stdout != '') {
    process.stdout.write('-'.repeat(32) + ' STDOUT ' + '-'.repeat(32) + '\n');
    process.stdout.write(buffer.stdout);
    process.stdout.write('-'.repeat(72) + '\n');
  }

  if (buffer.stderr != '') {
    process.stdout.write('-'.repeat(32) + ' STDERR ' + '-'.repeat(32) + '\n');
    process.stdout.write(buffer.stderr);
    process.stdout.write('-'.repeat(72) + '\n');
  }
}
