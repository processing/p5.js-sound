define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('sndcore');

  
   /**
    *  A gain node is usefull to set the relative volume of sound.
    *  It's typically used to build mixers.   
    *
    *  @class p5.Gain
    *  @constructor
    *  @example
    *  <div><code>
    *
    * // load two soundfile and crossfade beetween them
    * var sound1,sound2;
    * var gain1, gain2, gain3;
    * 
    * function preload(){
    *   soundFormats('ogg', 'mp3');
    *   sound1 = loadSound('../_files/Damscray_-_Dancing_Tiger_01');
    *   sound2 = loadSound('../_files/beat.mp3');
    * }
    *
    * function setup() {
    *   createCanvas(400,200);
    *
    *   // create a 'master' gain to which we will connect both soundfiles
    *   gain3 = new p5.Gain();
    *   gain3.connect();
    *
    *   // setup first sound for playing
    *   sound1.rate(1);
    *   sound1.loop();
    *   sound1.disconnect(); // diconnect from p5 output
    *
    *   gain1 = new p5.Gain(); // setup a gain node
    *   gain1.setInput(sound1); // connect the first sound to its input
    *   gain1.connect(gain3); // connect its output to the 'master'
    *
    *   sound2.rate(1);
    *   sound2.disconnect();
    *   sound2.loop();
    *
    *   gain2 = new p5.Gain();
    *   gain2.setInput(sound2);
    *   gain2.connect(gain3);
    *
    * }
    *
    * function draw(){
    *   background(180);
    *  
    *   // calculate the horizontal distance beetween the mouse and the right of the screen
    *   var d = dist(mouseX,0,width,0);
    *
    *   // map the horizontal position of the mouse to values useable for volume control of sound1
    *   var vol1 = map(mouseX,0,width,0,1); 
    *   var vol2 = 1-vol1; // when sound1 is loud, sound2 is quiet and vice versa
    *
    *   gain1.amp(vol1,0.5,0);
    *   gain2.amp(vol2,0.5,0);
    *
    *   // map the vertical position of the mouse to values useable for 'master volume control'
    *   var vol3 = map(mouseY,0,height,0,1); 
    *   gain3.amp(vol3,0.5,0);
    * }
    *</code></div>
    *
    */

 p5.Gain = function() {
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;
    this.input.connect(this.output);

    // add  to the soundArray
    p5sound.soundArray.push(this);
}

/**
   *  Connect a source to the gain node.
   *  
   *  @method  setInput
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   */


 p5.Gain.prototype.setInput = function(src) {
    src.connect(this.input);
}

/**
   *  Send output to a p5.sound or web audio object
   *  
   *  @method  connect
   *  @param  {Object} unit
   */
  p5.Gain.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all output.
   *  
   *  @method disconnect
   */
  p5.Gain.prototype.disconnect = function() {
    this.output.disconnect();
  };

  /**
   *  Set the output level of the gain node.
   *  
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime 
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Gain.prototype.amp = function(vol, rampTime, tFromNow) {
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
  };

  p5.Gain.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.output.disconnect();
    this.input.disconnect();
    this.output = undefined;
    this.input = undefined;
  }

});



