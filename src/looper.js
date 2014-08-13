define(function (require) {
  'use strict';

  // inspiration: https://github.com/cwilso/metronome/blob/master/js/metronome.js

  var p5sound = require('master');

  var lookahead = 25.0;       // How frequently to call scheduling function 
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

  var currentLoop; // which loop is playing now?
  var onStep = function(){};

  p5.Looper = function(steps, bLength) {
    this.length = steps || 16; // how many beats
    beatLength = bLength || 0.25; // defaults to 4/4
    this.noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note

    this.isPlaying = false;
    currentStep = 0;
    this.patterns = [];
  };

  p5.Looper.prototype.setBPM = function(BPM) {
    bpm = BPM;
    // this.interval = (60 / BPM) * 1000;
  };

  p5.Looper.prototype.start = function( ) {
    this.isPlaying = true;
    currentLoop = this; // set currentLoop to this

    if (this.isPlaying) { // start playing
      currentStep = 0;
      nextNoteTime = p5sound.audiocontext.currentTime;
      scheduler();    // kick off scheduling
    }
  };

  p5.Looper.prototype.stop = function( ) {
    this.isPlaying = false;
  };

  p5.Looper.prototype.addPattern = function(name, callback, array) {
    this.patterns.push( {
      'name' : name,
      'callback': callback,
      'array' : array
    });
  };

  p5.Looper.prototype.removePattern = function(name) {
    for (var i in this.patterns) {
      if (this.patterns[i].name === name) {
        this.patterns.split(i, 1);
      }
    }
  };

  p5.Looper.prototype.getPattern = function(name) {
    for (var i in this.patterns) {
      if (this.patterns[i] === name) {
        return this.patterns[i];
      }
    }
  };

  /**
   *  Fire a callback function every step
   *  @param  {Function} callback [description]
   *  @return {[type]}            [description]
   */
  p5.Looper.prototype.onStep = function(callback) {
    onStep = callback;
  };

  var nextNote = function() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / bpm;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += beatLength * secondsPerBeat;    // Add beat length to last beat time
    currentStep++;    // Advance the beat number, wrap to zero
    if (currentStep == currentLoop.length) {
        currentStep = 0;
    }
  };

  var scheduleNote = function( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    // console.log(currentStep);
    onStep();
    if (currentLoop) {
      for (var i = 0; i < currentLoop.patterns.length; i++) {
        if (currentLoop.patterns[i].array[beatNumber] !== 0) {
          currentLoop.patterns[i].callback(currentLoop.patterns[i].array[beatNumber]);
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

});