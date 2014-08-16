define(function (require) {
  'use strict';

  // inspiration: https://github.com/cwilso/metronome/blob/master/js/metronome.js

  var p5sound = require('master');

  var lookahead = 50.0;       // How frequently to call scheduling function 
                              //(in milliseconds)
  var nextNoteTime = 0.0; // when the next note is due.
  var scheduleAheadTime = 0.1;  // How far ahead to schedule audio (sec)
                                // This is calculated from lookahead, and overlaps 
                                // with next interval (in case the timer is late)
  var timerID = 0;            // setInterval identifier.
  var notesInQueue = [];
  var currentStep = 0;

  var bpm = 120;
  var beatLength;

  var mode;

  var currentLoop; // which loop is playing now?
  var onStep = function(){};

  p5.prototype.setBPM = function(BPM) {
    bpm = BPM;
  };

  p5.Part = function(steps, bLength) {
    this.length = steps || 16; // how many beats
    beatLength = bLength || 0.25; // defaults to 4/4
    this.noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note

    this.isPlaying = false;
    this.parts = [];

    // what does this looper do when it gets to the last step?
    this.onended = function(){
      this.stop();
    };

  };

  p5.Part.prototype.start = function() {
    currentStep = 0;
    this.isPlaying = true;
    currentLoop = this; // set currentLoop to this

    if (mode !== 'score') { // start playing
      nextNoteTime = p5sound.audiocontext.currentTime;
    }
    scheduler();    // kick off scheduling

  };

  p5.Part.prototype.loop = function( ) {
    // rest onended function
    this.onended = function() {
      currentStep = 0;
    };
    this.start();
  };

  p5.Part.prototype.noLoop = function( ) {
    // rest onended function
    this.onended = function() {
      this.stop();
    };
  };

  p5.Part.prototype.stop = function( ) {
    this.isPlaying = false;
    currentStep = 0;
  };

  p5.Part.prototype.pause = function( ) {
    this.isPlaying = false;
  };

  p5.Part.prototype.addPhrase = function(name, callback, array) {
    this.parts.push( {
      'name' : name,
      'callback': callback,
      'array' : array
    });
  };

  p5.Part.prototype.removePhrase = function(name) {
    for (var i in this.parts) {
      if (this.parts[i].name === name) {
        this.parts.split(i, 1);
      }
    }
  };

  p5.Part.prototype.getPhrase = function(name) {
    for (var i in this.parts) {
      if (this.parts[i] === name) {
        return this.parts[i];
      }
    }
  };

  /**
   *  Fire a callback function every step
   *  @param  {Function} callback [description]
   *  @return {[type]}            [description]
   */
  p5.Part.prototype.onStep = function(callback) {
    onStep = callback;
  };

  var nextNote = function() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / bpm;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += beatLength * secondsPerBeat;    // Add beat length to last beat time

    currentStep++;    // Advance the beat number, wrap to zero

    if (currentStep >= currentLoop.length) {
      currentStep = 0;
      // fire the current loop's onended function
      currentLoop.onended(); 
    }

  };

  var scheduleNote = function( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    onStep();
    if (currentLoop) {
      for (var i = 0; i < currentLoop.parts.length; i++) {
        if (currentLoop.parts[i].array[beatNumber] !== 0) {
          currentLoop.parts[i].callback(currentLoop.parts[i].array[beatNumber]);
        }
      }
    }
  };

  var scheduler = function() {
    if (currentLoop.isPlaying ) {
      // while there are notes that will need to play before the next interval, 
      // schedule them and advance the pointer.
      while (nextNoteTime < p5sound.audiocontext.currentTime + scheduleAheadTime ) {
          scheduleNote( currentStep, nextNoteTime );
          nextNote();
      }
      timerID = window.setTimeout( scheduler, lookahead );
    }
  };

  // ===============
  // p5.Score
  // ===============

  var score, parts, currentPart;

  p5.Score = function() {
    // for all of the arguments
    parts = [];
    currentPart = 0;

    for (var i in arguments) {
      parts[i] = arguments[i];
      parts[i].nextPart = parts[i+1];
      parts[i].onended = function() {
        playNextPart();
      };
    }
    this.looping = false;
  };

  p5.Score.prototype.onended = function() {
    if (this.looping) {
      parts[0].start();
    } else {
      parts[parts.length - 1].onended = function() {
        parts[parts.length - 1].stop();
      }
    }
    currentPart = 0;
  };

  p5.Score.prototype.start = function() {
    mode = 'score';
    score = this;
    parts[currentPart].start();
    currentStep = 0;
  };

  p5.Score.prototype.stop = function() {
    parts[currentPart].stop();
    currentPart = 0;
    currentStep = 0;
  };

  p5.Score.prototype.pause = function() {
    parts[currentPart].stop();
  };

  p5.Score.prototype.loop = function() {
    this.looping = true;
    this.start();
  };

  p5.Score.prototype.noLoop = function() {
    this.looping = false;
  };

  function playNextPart() {
    currentPart++;
    if (currentPart >= parts.length) {
      currentStep = 0;
      score.onended();
    } else {
      currentStep = 0;
      parts[currentPart].start();
    }
  }

});