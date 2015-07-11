/*
 * grunt-init-jquery
 * https://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

// Basic template description.
exports.description = 'Create my project.';

// Template-specific notes to be displayed before question prompts.
exports.notes = 'project ノート';

// Template-specific notes to be displayed after question prompts.
exports.after = 'You should now install project dependencies with _npm ' +
  'install_. After that, you may execute project tasks with _grunt_. For ' +
  'more information about installing and configuring Grunt, please see ' +
  'the Getting Started guide:' +
  '\n\n' +
  'http://gruntjs.com/getting-started';

// Any existing file or directory matching this wildcard will cause a warning.
// exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {
  // See the "Inside an init template" section.

  init.process({}, [
    // Prompt for these values.
    init.prompt('name'),
    init.prompt('port'),
  ], function(err, props) {
    // A few additional properties.
    props.keywords = [];

    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props, {noProcess: 'libs/**'});



    // All done!
    done();
  });
};
