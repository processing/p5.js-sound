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

  var bpm = 120;
  var beatLength;

  var mode;

  // var currentStep = 0;
  // var currentLoop; // which loop is playing now?
  var activeParts = []; // array of active parts replaces currentLoop

  var onStep = function(){};

  p5.prototype.setBPM = function(BPM) {
    bpm = BPM;
  };

  // Phrase knows its currentStep
  p5.Phrase = function(name, callback, array) {
    this.phraseStep = 0;
    this.name = name;
    this.callback = callback;
    this.array = array;
  };

  // PARTS
  p5.Part = function(steps, bLength) {
    this.length = steps || 16; // how many beats
    this.partStep = 0;
    this.phrases = [];

    beatLength = bLength*4 || 0.5; // defaults to 4/4
    this.noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note

    this.isPlaying = false;
    // this.parts = [];

    // what does this looper do when it gets to the last step?
    this.onended = function(){
      console.log('play part bang');
      this.stop();
    };
  };

  p5.Part.prototype.start = function() {
    this.partStep = 0;
    this.isPlaying = true;
    activeParts.push(this); // set currentLoop to this

    if (mode !== 'score') { // start playing
      nextNoteTime = p5sound.audiocontext.currentTime;
    }
    scheduler();    // kick off scheduling

  };

  p5.Part.prototype.loop = function( ) {
    // rest onended function
    this.onended = function() {
      this.partStep = 0;
      console.log('loop part bang');
      // dont start phrases over, right?
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
    this.partStep = 0;
  };

  p5.Part.prototype.pause = function( ) {
    this.isPlaying = false;
  };

  // can either be a p5.Phrase or a name, callback, array
  p5.Part.prototype.addPhrase = function(name, callback, array) {
    var p;
    if (arguments.length === 3) {
      p = new p5.Phrase(name, callback, array);
    } else if (arguments[0] instanceof p5.Phrase) {
      p = arguments[0];
    } else {
      throw 'invalid input. addPhrase accepts name, callback, array or a p5.Phrase';
    }
    this.phrases.push(p);

    // reset the length if phrase is longer than part's existing length
    if (p.length > this.length) {
      this.length = p;
    }
  };

  p5.Part.prototype.removePhrase = function(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases.split(i, 1);
      }
    }
  };

  p5.Part.prototype.getPhrase = function(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        return this.phrases[i];
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


    for (var i in activeParts) {

      // increment partStep
      activeParts[i].partStep++;    // Advance the beat number, wrap to zero
      // fire the current loop's onended function
      if (activeParts[i].partStep >= activeParts[i].length) {
        activeParts[i].onended(); 
        console.log(activeParts[i].partStep +', ' +activeParts[i].length);
      }

      if (activeParts[i].partStep >= activeParts[i].length) {
        activeParts[i].partStep = 0;
      }

      for (var j in activeParts[i].phrases) {
        activeParts[i].phrases[j].phraseStep++;    // Advance the beat number, wrap to zero
        if (activeParts[i].phrases[j].phraseStep >= activeParts[i].phrases[j].array.length) {
          activeParts[i].phrases[j].phraseStep = 0;
        }
      }
    }
  };

  var scheduleNote = function( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    onStep();

    for (var i in activeParts) {
      for (var j = 0; j < activeParts[i].phrases.length; j++) {
        var thisPhrase = activeParts[i].phrases[j];
        if (thisPhrase.array[thisPhrase.phraseStep] !== 0) {
            thisPhrase.callback(thisPhrase.array[thisPhrase.phraseStep]);
            // console.log(thisPhrase.name +', '+ thisPhrase.array[thisPhrase.phraseStep]);
        }
      }
    }
  };

  var scheduler = function() {
    for (var i in activeParts) {
      if (activeParts[i].isPlaying ) {
        // while there are notes that will need to play before the next interval, 
        // schedule them and advance the pointer.
        while (nextNoteTime < p5sound.audiocontext.currentTime + scheduleAheadTime ) {
            scheduleNote( activeParts[i].partStep, nextNoteTime );
            nextNote();
        }
        timerID = window.setTimeout( scheduler, lookahead );
      }
    }
  };

  // ===============
  // p5.Score
  // ===============

  var score;
  //parts, currentPart;

  p5.Score = function() {
    // for all of the arguments
    this.parts = [];
    this.currentPart = 0;

    var thisScore = this;
    for (var i in arguments) {
      this.parts[i] = arguments[i];
      this.parts[i].nextPart = this.parts[i+1];
      this.parts[i].onended = function() {
        thisScore.resetParts();
        playNextPart(thisScore);
      };
    }
    this.looping = false;
  };

  p5.Score.prototype.onended = function() {
    if (this.looping) {
      this.resetParts();
      this.parts[0].start();
    } else {
      this.parts[this.parts.length - 1].onended = function() {
        this.stop();
        this.resetParts();
      }
    }
    this.currentPart = 0;
  };

  p5.Score.prototype.start = function() {
    mode = 'score';
    // score = this;
    this.parts[this.currentPart].start();
    this.scoreStep = 0;
  };

  p5.Score.prototype.stop = function() {
    this.parts[this.currentPart].stop();
    this.currentPart = 0;
    this.scoreStep = 0;
  };

  p5.Score.prototype.pause = function() {
    this.parts[this.currentPart].stop();
  };

  p5.Score.prototype.loop = function() {
    this.looping = true;
    this.start();
  };

  p5.Score.prototype.noLoop = function() {
    this.looping = false;
  };

  p5.Score.prototype.resetParts = function() {
    for (var i in this.parts) {
      this.parts[i].stop();
      this.parts[i].partStep = 0;
      for (var p in this.parts[i].phrases){
        this.parts[i].phrases[p].phraseStep = 0;
      }
    }
  };

  function playNextPart(aScore) {
    aScore.currentPart++;
    if (aScore.currentPart >= aScore.parts.length) {
      aScore.scoreStep = 0;
      aScore.onended();
    } else {
      aScore.scoreStep = 0;
      aScore.parts[aScore.currentPart - 1].stop();
      aScore.parts[aScore.currentPart].start();
    }
  }

});