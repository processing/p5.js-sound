# p5.sound to do list

### This is a list of things that we hope to accomplish with p5.sound. If you want to work on one of these, or discuss an idea, feel free to make a github issue. Got something to add to the list? We'd love to hear it!

- Incorporate the new [Stereo Panner Node](http://webaudio.github.io/web-audio-api/#the-stereopannernode-interface), with a fallback to the existing panner for browsers that don't yet support StereoPanner.

* p5.Amplitude normalize method should be dynamic. It can accept a parameter that determins how fast it decays.

- Figure out a way to keep track of connections between objects. From there, .disconnect() can accept a specific object rather than disconnecting all output.

* Make sure all methods that should be modular can accept a Number, AudioParam, p5.Envelope, p5.Oscillator or p5.Signal as input.

- Log a message to the console if a user calls FFT methods like getEnergy without first calling .analyze() in either the draw loop, or in the method in which they call getEnergy. Maybe log the time that .analyze was last called, and compare it to the current time, and if it is a big gap, then log the message?

* SoundFile.playMode('untilDone') would play a sound if not already playing, but if it is already playing, it would not play again until it is done. Feel free to re-open this [Github Issue](https://github.com/processing/p5.js-sound/issues/5) if you want to work on this.

- Improve p5.Pulse (PWM)

* What additional features/analysis would be useful for visualization / analysis? Look into handling these with an offline audio context, and/or scripts that could analyze a file and then save the result to JSON.
  - Peak Detect https://github.com/processing/p5.js-sound/issues/12
  - Beat Detect -- [here's an example](http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/) handled by an offline audio context
  - Pitch detect -- [here's an example](https://webaudiodemos.appspot.com/pitchdetect/index.html).

- Enhance the examples from [p5 music viz workshop repo](https://github.com/therewasaguy/p5-music-viz) and make these more accessible, perhaps as a section of p5js.org. Some useful examples to add:
  - Creating and working w/ lyric files (LRC) or other timestamped data
  - Synthesizing musical patterns (i.e. with p5.Part) and mapping these to visuals
  - Using the p5.dom library to add a drag-and-drop area for mp3s (examples currently use custom dragfile.js)
  - Loading music to p5.SoundFile from external API’s

* Build a prototype for a p5.Synth.
  - Pubilsh a spec for how synths should behave that enables people to add/share their own instruments.
  - Figure out how to handle voice allocation.
  - Including some nice sounding [custom oscillator periodicwaves](http://webaudio.github.io/web-audio-api/#the-periodicwave-interface)

- Build out current effects and develop new ones.
  - Publish a spec so that people can easily share/add custom effects
  - How best to apply an effect like p5.Reverb to all sound in the sketch? Perhaps p5.soundOut gets a wet/dry effects bus.

* Mixer and Wet/Dry

- Prepare to implement the [AudioWorker](http://webaudio.github.io/web-audio-api/#the-audioworker), because ScriptProcessor will soon be depricated. We'll likely need a fallback during this transition.

* Write tests and benchmark performance.

* Custom callbacks for error in getUserMedia when it is not available (i.e. in Safari)

* Documentation:
  - Make sure there are no looping sounds in the reference examples.
  - Lower amplitude on all examples

- Update p5.FFT API to reflect [changes in the Processing Sound FFT API](https://github.com/processing/processing-docs/issues/221)

- Add option to p5.FFT that returns data in decibels (from Float32Array)

- p5.Envelope should be able to connect to multiple
- p5.Envelope takes no action on triggerRelease unless currently playing

- Add a logarithmic scaling option for p5.FFT
- p5.SoundFile.getPeaks should be able to return stereo peaks. Like [this](https://github.com/olosmusic/olos-soundfile/blob/master/olos-soundfile.html#L379)
- Add the ability to decode audio buffer data from a FileReader and add it to a p5.SoundFile buffer, like [this](https://github.com/olosmusic/olos-soundfile/blob/master/olos-soundfile.html#L227)
- Add ability to map a soundfile playback rate to a pitch ratio, like [this](https://github.com/ericrosenbaum/MK-1/blob/gh-pages/sketch.js#L488)
- when a soundFile is reversed, reverse currentTime as well for accurate playback position
- add an 'onended' function to SoundFile.bufferSourceNode that toggles \_playing to false when done playing

AFTER HERE, COPIED FROM WIKI PAGE ON 2023-02-18

# p5.js-sound to do list

# Installation

- Clone this repo and navigate to within the `p5.js-sound` folder. You can type `cd` (change directory) and then drag the folder into the terminal window to copy the address of the folder.
- Install the following dependencies:
  - [`npm`](https://www.npmjs.com/) (Node Package Manager). The easiest way to do this is by installing [node.js](http://nodejs.org/), which automatically installs `npm` for you.
  - [`grunt`](https://gruntjs.com/) command line interface. This is the task runner we use to build the library from source files. Install from the command line using npm: `sudo npm install -g grunt-cli`.

* Run `npm install` from the command line. This downloads the node modules that we use to build the `p5.sound.js` file from the source files in the `/src` folder, as well as modules used for running tests and other tasks.
* Run `grunt` from the command line to compile the library. This will update the p5.sound.js and p5.sound.min.js files in the `/lib` directory with any changes from the `/src` directory.

# Overview

- `lib/` Contains the concatenated p5.sound.js and p5.sound.min.js libraries, generated by Grunt.

- `src/` Contains all the source code for the library. The code is broken up into folders and files corresponding with the [Processing reference page](http://processing.org/reference/). Additionally, there is a core folder that holds constants, and internal helper functions and variables.

- `tests/` Contains unit testing files.

- `examples/` Contains code examples including a port of all of Dan Shiffman's [Learning Processing](learningprocessing.com), as well as an empty-empty example that demonstrates setting up a sketch, and examples related to specific [tutorials](https://github.com/processing/p5.js/wiki/Tutorials).

# Making changes

Once you are set up, you can make changes in a variety of ways:

- **Adding features** Simply find the module you want to edit by looking for its files in the `/src` folder. Then, re-build the library by calling `grunt` from the command line when you are ready to try out your changes.

- **Writing documentation** `p5.js-sound` uses inline documentation. A good example for how to format and write inline documentation can be seen in [p5.Oscillator](https://github.com/processing/p5.js-sound/blob/main/src/oscillator.js).

- **Writing automatic tests** More information [below](#testing).

# Testing

Ideally, all new functions will be implemented with unit tests and inline documentation. Examples of unit tests can be found in the [tests](https://github.com/processing/p5.js-sound/tree/main/test/tests) directory. Directions for adding your own tests and including them are below.

The testing is done with the [mocha](https://mochajs.org/) test framework and by running the tests in a browser window.

To get started:

1. Install dependencies.
   ```
   cd p5.js-sound/
   npm install
   ```
2. Add test files corresponding to files in `src` (more info about Chai assert style TDD phrasing [here](http://chaijs.com/api/assert/)).
3. Register your new test files by adding their names to the `allTests` array in `test.js`.
4. Run the tests in the browser (see below).

### Running tests in the browser

It is useful to run tests in the browser, especially when trying to debug test failures on different browsers. To run the tests in the browser:

1. Run the connect server. `grunt serve` or `python -m SimpleHTTPServer`
2. Open `localhost:8000/test` in your favourite web browser, or multiple browsers.

# Code style (Linting)

We use [eslint](http://eslint.org/) to help with code styling and conventions. The goal is to have some consistent styles that nudge all contributors towards good standards/best practices without the need to get nitpicky in code review. It is optional for now, but should be helpful for developers who choose to use it.

Linting rules are in this file: `src/.eslintrc`.

1. Install eslint: `npm install -g eslint`. If necessary, update dependencies using `npm install`.
2. Run `grunt lint` to lint the entire `src/` directory (displays linting errors in the directory).
3. You can auto-fix errors on the terminal, with the optional `--fix` flag that will fix some (but not all) linting errors. For example, to fix the errors in `src/audioin.js`, run `eslint src/audioin.js --fix` which will fix all the auto-fixable errors in that file.
4. Alternatively (or for the non-auto-fixable errors), you can open those files and fix those errors manually.

# Main branch development

0. **Install System Tools:**
   - [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   - [node.js](https://nodejs.org) (includes npm, the Node Package Manager)
   - Grunt CLI: `npm install -g grunt-cli`
1. **Fork, Clone, Configure Remotes, Install Dependencies**
   - Fork https://github.com/processing/p5.js-sound to your github account.
   - Clone your fork of the repo from Terminal: `git clone --depth=50 https://github.com/<your-username>/p5.js-sound`
   - Navigate to the newly cloned directory: `cd p5.js-sound`
   - Add a reference to the original repo as a remote called "upstream":
     `git remote add upstream https://github.com/processing/p5.js-sound`
   - Install Dependencies: `npm install` --> This creates a folder called "node_modules" with all the dependencies listed in "package.json"
2. **Get Latest Changes** ^
   - If you cloned a while ago, get the latest changes from upstream:
     - `git checkout main` --> switch to your "main" branch
     - `git pull upstream main` --> pull changes from the "main" branch of the remote repo we called "upstream"
3. **Create a new branch** ^
   - `git checkout -b <topic-branch-name>`
     - `-b` creates the branch
     - `checkout` makes this your current branch. Updates all the files to reflect whatever’s in that branch
     - `checkout -b` does both at the same time.
     - _This is a good idea in case your PR is not accepted right away, and you want to work on something else in the meantime. Because any commits you make to a branch with an unresolved pull requests will be added to the pull request._
4. **Make Some Edits...**
   - p5.sound.js and p5.sound.min.js are built from the modules in the /src folder. Edit your module(s)
   - `grunt` --> builds new version of the library. Also runs a bunch of other tasks defined in Gruntfile.js, including jshint which enforces [these style guidelines](https://github.com/processing/p5.sound.js/blob/main/src/.jshintrc).
   - `grunt watch` --> every time you save, grunt re-builds the library
   - _Recommended: create an example in the /examples folder to manually test whatever you're working on if it is a bug fix or new feature. You may consider adding this as an example, or leave it out when you commit changes._
5. **Write Automated Tests** ^
   - Tests live in "test/unit/<unit_name>" and are linked via "[test/test.html](https://github.com/processing/p5.js-sound/blob/main/test/test.html)"
   - [More info on Testing with p5.js](https://github.com/processing/p5.js/wiki/Development#testing)
6. **Document Changes** ^
   Info [here](https://github.com/processing/p5.js-sound/wiki/Documentation)
7. **Commit Your Changes**
   - `git add <files you want to include>`
   - `git commit -m <your short commit message>`
   - Commit messages should explain what change(s) you made in the imperitive tense, i.e. "fix bug with ellipse"
   - If you have a messy commit history, you can use [git rebase](https://help.github.com/articles/about-git-rebase/) to tidy up before sending the pull request.
8. **Locally Merge (or rebase) Upstream Changes** ^
   - `git pull upstream main` --> merge your changes with upstream changes
   - Or, `git pull --rebase upstream main` --> applies your changes ontop of the upstream changes
9. **Push To Your Fork**
   - `git push origin <topic-branch-name>`
10. **Open Pull Request to p5.sound main branch**
    - GitHub info on [Creating](https://help.github.com/articles/creating-a-pull-request) & [Using Pull Requests](https://help.github.com/articles/using-pull-requests/)
    - Clear description of changes, clear title, imperative tense (i.e. "fix bug")
11. **Discuss & Amend Pull Request**
    - Pull Requests can be discussed, just like issues [example](https://github.com/processing/p5.js/pull/454)
    - Pull Requests are not static snapshots of your repo. They update whenever you add more commits to the branch, until the PR is accepted.

^ These are optional, but recommended, and sometimes these things (like adding documentation) encompass your entire contribution.

# Useful Git Commands

- `git remote -v` List all your remotes "verbosely"
- `git pull <name_of_the_remote> <branch_name>`
- `git push <name_of_the_remote> <branch_name>`
- `git checkout -b <topic-branch-name>` Create a new branch and check it out
- `git stash` Stash all uncommitted changes you’ve made to the branch. You can get them back later.
- `git commit --amend` Amend your previous commit rather than creating a new commit

# Addendum:

DOCUMENTATION

The documentation that appears at https://p5js.org/reference/#/libraries/p5.sound is all generated automatically from inline comments. This happens once a new version of the p5.sound library is merged into the p5.js repo and included in a [release](https://github.com/processing/p5.js/releases).

### Preview documentation

1. Clone the p5.js-sound repo and install all packages.
2. Build a new version of `p5.sound.js` by running `grunt` in the p5.js-sound repo.
3. Move that file to your local p5.js repo, replacing `p5.js/lib/addons/p5.sound.js`
4. Now that the p5.sound.js file is in the p5.js repo, follow the instructions [here](https://github.com/processing/p5.js/blob/master/contributor_docs/inline_documentation.md#generating-documentation) for generating documentation in the p5.js repo:

   > Run `grunt yui:build` once first to generate all local files needed

   > To preview it locally, run `grunt yui:dev` and view it as [http://localhost:9001/docs/reference/](http://localhost:9001/docs/reference/).

   (p5.js-sound documentation will appear at http://127.0.0.1:9001/docs/reference/#/libraries/p5.sound)

--OR-- use [this node.js script](https://gist.github.com/therewasaguy/1e397ff8762323372c2d32fd93bafb91) that attempts to automate ^.

--OR-- use [this node.js script](https://gist.github.com/therewasaguy/e6ee64ca3d46ed5cc88898196c77050f) if you want to bring in the p5.js-website repo, too.

Releasing a new version of p5.sound library

Here's how to release a new version of the p5.sound library

- Compile new versions of the library and set the new version number according to semver

  - Version can be updated in package.json before compiling

- Verify that Reference web pages look ok on the p5.js-website when using the newly compiled library (instructions [here](https://github.com/processing/p5.js-sound/wiki/Documentation))
- Draft a new release https://github.com/processing/p5.js-sound/releases
  - Mention all relevant fixes and changes that are included since the last release (with links to PR’s and shoutouts to contributors as applicable) - use this filter to figure out what has happened since the most recent release: https://github.com/processing/p5.js-sound/pulls?q=is%3Apr+is%3Amerged
  - Example: https://github.com/processing/p5.js-sound/releases/tag/0.3.12
  - Attach p5.sound.js and p5.sound.min.js files with the new version numbers
- Make a PR to p5.sound with the newly compiled /lib directory and the description of the release
- Publish the release!

- Make a PR to p5.js replacing with the newly compiled p5.sound.js and p5.sound.min.js files. Include a description of the release in the PR
- Make a PR to p5.js-website replacing with the newly compiled p5.sound.js and p5.sound.min.js files. Include a description of the release in the PR
- ...wait for a new release of p5.js to include our updated version (see https://github.com/processing/p5.js/blob/main/contributor_docs/release_process.md )

Unit Testing in p5.js sound

# Table of Contents

- [Intro](#intro)
- [Running the tests](#running-the-tests)
  - [Running only one test/suite](#running-only-one-testsuite)
  - [skipping a test/suite](#skipping-a-testsuite)
- [Infrastructure](#infrastructure)
  - [Frameworks](#frameworks)
  - [Environments](#environments)
    - [1.In browser](#1-in-browser)
    - [2.Headless testing using puppeteer](#2-headless-testing-using-puppeteer)
    - [3.Headless testing using karma](#3-headless-testing-using-karma)
- [Adding new tests](#adding-new-tests)

# Intro

Unit test is a way of testing a unit - the smallest piece of code that can be logically isolated in a system. Unit tests are vital to a codebase as they ensure that individual components work as intended. They not only make the code more consistent but also ensures that any addition of new code won’t break the existing one.

You can refer to [this](https://codeburst.io/javascript-unit-testing-using-mocha-and-chai-1d97d9f18e71) article for a good intro to unit testing.

In this page, you will learn about the unit testing architecture of this library and also about how to run the tests. You will also learn how to contribute to the library's testing by adding new unit tests.

# Running the tests

To run the tests, you need to clone the library into your local computer. You can follow [these](https://github.com/processing/p5.js-sound/wiki/Contribute#installation) instructions to setup.

Once the setup is done, open the terminal and go to the root directory

```
cd p5.js-sound
```

Once you are in the repo's root, use the following command to run the tests in your terminal

```
grunt test
```

You can learn about the different types of testing environments [here](#environments).

## Running only one test/suite

While writing your own tests, testing only one test case or only one suite will come in handy.
To run only a single test or suite, you can append `.only` to the function.

For example,
to test only one suite, say `delay.js`, you can change the describe statement in `test/tests/p5.Delay.js` from

```js
describe('p5.Delay', function () {
  // some test cases
});
```

to

```js
describe.only('p5.Delay', function () {
  // some test cases
});
```

Similarly to run only one test, you can change the `it` function of that test to

```js
it.only('', function () {});
```

You can read more about this [here](https://mochajs.org/#exclusive-tests)

## Skipping a test/suite

This feature is the inverse of `.only()`.

Some times, when you are unsure of a test case or a suite, you can skip that test/suite by using `skip`.By appending `.skip()`, you may tell Mocha to ignore test case(s)
You can read more about this [here](https://mochajs.org/#inclusive-tests)

# Infrastructure

You can see the file structure of the testing folder below :

<img src="https://github.com/processing/p5.js-sound/raw/main/docs/wiki-assets/file-architecture.png" alt="file structure of p5.js-sound library's test folder" width="200"/>

- Everything related to the testing is located in the `/test` folder.
- All the tests are located in the `/test/tests` folder.

  - If you are trying to add a new test file, make sure it follows the existing conventions.  
    For example, if you want to write tests for `/src/audiocontext.js`, the test file should be named as `p5.AudioContext.js` (except main.js),
  - keep in mind that file name should follow CamelCasing

- All the audio samples, that are used in testing are located in the `/test/testAudio` folder.
- All the grunt tasks need for test automation are located in the `/test/tasks` folder.
- The setup and some configuration options to run the tests are created in `/test/setup.js` file.
- All the test files are added to the `spec` array in `/test/tests.js` file.

## Frameworks

- We use [mocha](https://mochajs.org/) for structuring and running our unit tests.
- We use [chai's](https://www.chaijs.com/api/assert/) assert (and expect) to write individual statements about how code should behave.
- We use [puppeteer](https://pptr.dev/) to run headless tests.
- We also use [karma-js](https://karma-runner.github.io/latest/index.html) to run headless tests.

## Environments

We can run the tests in 3 environments.

### 1. In browser

<img src="https://github.com/processing/p5.js-sound/raw/main/docs/wiki-assets/browser-tests.png" alt="a screenshot of the tests run in browser environment" width="800"/>

It is useful to run tests in the browser, especially when trying to debug test failures on different browsers.
To run the tests in the browser:

1.  Run the connect server. `grunt serve` or `python -m SimpleHTTPServer`
2.  Open `localhost:8000/test` in your favourite web browser, or multiple browsers.

Optionally, you can also run `npm run dev` so that the library is updated while you are coding and also the server stay connected.
The code for the testing in browser can be found in `test/index.html`

You can learn more about running mocha in browser [here](https://mochajs.org/#running-mocha-in-the-browser)

### 2. Headless testing using puppeteer

 <img src="https://github.com/processing/p5.js-sound/raw/main/docs/wiki-assets/mocha-chrome-tests.png" alt="a screenshot of terminal showing the tests run in headless-puppeteer environment" width="700"/>  
  
You can run tests in the terminal using headless chrome so that you do not have to open a browser.
You can also see the status of the tests being run in the terminal.

To run the tests in headless chrome, you can use the following command in the terminal:

```
grunt test
```

The code for testing in headless chrome can be found in `test/tasks/mocha-chrome.js` which is loaded as a grunt test and `test/headless-test.html`

### 3. Headless testing using karma

You can also run tests in the terminal using karma-js. The difference between this environment and the headless chrome is that the test files are bundled using webpack while using karma. So, the tests are more consistent while run using karma. Hence, we can use this method to automate in github continuous integration in future.

You cannot see the status of tests while running the tests in this method.

To run the tests using karma, you can use the following command in the terminal:

```
npm run karma
```

The code for testing in headless chrome can be found in root folder, `karma.conf.js`.

# Adding new tests

If you want to write new unit tests to the library, check if there already exists a test file for the file you want to test.  
 For example, if you want to write tests for a function in `src/fft.js`, check if there is a file in the `test/tests` folder called `p5.FFT.js`. If not, you can add the file and be the first to test that file.

If you have added a new file for testing, you also have to add that file in the `spec` array in `test/tests.js` file for it to run with all other tests.

If you are adding a new file for testing, another point to keep in mind is that you have to follow the existing conventions of writing tests to maintain consistency across the library, which are:

- You have to include the file name in the `describe` function.
- You have to include the expected behaviour of the test behaviour in `it` function.
  - You have to write the behaviour so that the sentence makes sense when reading it together with 'it'.
  - For example, if you are testing if a function can start and stop an audio node, the `it` function should be
  ```js
  it('can be started and stopped', function () {});
  ```
  - As you can see the sentence 'it can be started and stopped' makes sense
- If you are testing a Class, you can add another level of suite which tests all the methods of that class, which can be found in almost all the files

To demonstrate, let's take the file `src/effect.js`. To add tests to this file, we first check the `test/tests` folder if there is a file for `effect.js`. If not, we create a file called `p5.Effect.js` in this folder. We should also remember to add this file in the `spec` array in `test/tests.js`.

Now, lets add tests to a function called `drywet` in this file. To do that, we need to understand the functionality of that function.  
**Expected Behaviour:** It takes one argument, the desired dry/wet value. If the value is passed, it sets the dry/wet value and returns the value set. If value is not passed, it simply returns the existing dry/wet value. The initial value of dry/wet is 1.

So, the possible test cases can be:

1. Initially when no argument is passed, it should return 1
2. If a value is passed, it should set the value to that value.
3. If dry/wet value is set and no argument is passed, it should return that value.
4. If you can think of more, go ahead and add tests for them!

Now, to test these functions,
We can create a test suite in `p5.Effect.js` to test this method. So, after adding these tests, the test file may look like this:

```js
 describe('p5.Effect', function () {
   describe('drywet', function () {
     it('should have an initial value of 1', function () {
       // write test here
     });
     it('can set the drywet value', function () {
       // write test here
     });
     it('can return the drywet value', function () {
       // write test here
     });
   })
 )}
```
