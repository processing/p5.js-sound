define(function (require) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');
  /**
   *  A p5.EQ uses a chain of Web Audio Biquad Filters
   *  to modify the spectrum of a sound input source. 
   *
   *  @class p5.EQ
   *  @constructor
   *  @param {[Number]} _eqsize default: 8
   *  @return {Object} p5.EQ
   *  @example
   *  <div><code>
   *  vvar fft;
   *  var noise, eq;

   * var cpts = [];
   * var splineV = [];
   * var circleSize;

   * function setup() {
   * createCanvas(710, 256);
   *   //sound wave color
   *  fill(255, 40, 255);
   *  circleSize = 15;
   *  eq = new p5.EQ(8);


   *  // Disconnect soundfile from master output.
   *  // Then, connect it to the filter, so that we only hear the filtered sound
   *  noise = new p5.Noise();
   *  noise.disconnect();
   *  eq.process(noise);
   *  noise.amp(0.1);
   *  noise.start();

   *  fft = new p5.FFT();


   *  for (var i = 0; i < 8; i++) {
   *    cpts[i] = new Cpt(i);
   *    splineV[i] = [cpts[i].x,cpts[i].y];
   *  }

   * }

   * function draw() {
   *  background(30);
   *  // strictBoundaries();

   *  // Draw every value in the FFT spectrum analysis where
   *  // x = lowest (10Hz) to highest (22050Hz) frequencies,
   *  // h = energy / amplitude at that frequency
   *  var spectrum = fft.analyze();
   *  noStroke();
   *  for (var i = 0; i< spectrum.length; i++){
   *    var x = map(i, 0, spectrum.length, 0, width);
   *    var t = -height + map(spectrum[i], 0, 255, height, 0);
   *    rect(x, height, width/spectrum.length, t) ;
   *  }

   *  for (var i = 0; i < cpts.length; i++) {
   *    cpts[i].display();
   *    cpts[i].move();
   *    splineV[i] = [cpts[i].x,cpts[i].y];
   *  }

   *  stroke(255,255,255);
   *  noFill();
   *  beginShape();
   *    curveVertex( splineV[0][0],splineV[0][1])
   *    for (var i = 0; i < splineV.length; i++) {
   *      curveVertex( splineV[i][0],splineV[i][1]);
   *    }
   *    curveVertex( splineV[7][0],splineV[7][1])
   *  endShape();
   * }


   *  function Cpt(i){
   *   this.c = color(255);
   *  this.x = 100*i+5
   *  this.y = 128;
   *  this.ind = i;

   *  this.display = function () {
   *    fill(this.c);
   *    ellipse(this.x,this.y,circleSize,circleSize);
   *  }

   *  this.move = function () {
   *    if (this.ind == 0 || this.ind == 7){
   *      mouseOnHandle(this.x,this.y) ? (this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
   *    } else{
   *      mouseOnHandle(this.x,this.y) ? (this.x=mouseX, this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
   *    }

   *    if (this.y < 1) {this.y = 1;}
   *    else if (this.y >255) { this.y = 255;}
   *    else if (this.x < 1) { this.x = 1;}
   *    else if (this.x > 709) { this.x = 709;} 
   *  }
   *  this.toggle = function () {
   *    eq.toggleBand(this.ind);
   *    eq.bands[this.ind].toggle ? this.c = color(255) : this.c = color(30);
   *  }
   * }



   *  function mouseClicked(){
   *   //console.log(cpts.length);
   * for (var i = 0; i < cpts.length; i++) {
    
   * if (mouseX > cpts[i].x - circleSize && mouseX < cpts[i].x + circleSize &&
   *       mouseY > cpts[i].y - circleSize && mouseY < cpts[i].y + circleSize){
   *    cpts[i].toggle();
   *  } 
   * }
      
   *  }

   *  function makeAdjustment(band,y,x){
   *  eq.setBand(band,"mod",map(y,256,0, -40, 40), map(x,0,710,0,22050));
   * }

   * function mouseOnHandle(x,y){
   *    if (mouseX > x - circleSize && mouseX < x + circleSize &&
   *     mouseY > y - circleSize && mouseY < y + circleSize &&
   *     mouseIsPressed){
   *      return true;
   *    }
   * else{
   *    return false;
   *  }
  * }
   *  </code></div>
   */


  p5.EQ = function(_eqsize) {

    //default size is 8 band EQ
    _eqsize = _eqsize || 8;

    Effect.call(this);
    
    this.bands = [];

    /**
      *  The p5.EQ is built with
      *  <a href="http://www.w3.org/TR/webaudio/#BiquadFilterNode">
      *  Web Audio BiquadFilter Node</a>.
      *  
      *  @property biquadFilter
      *  @type {Object}  Web Audio Delay Node
      *
      *  @{param} toggle {boolean} On/of switch for band, true == on
    */
    for (var i = 0; i<_eqsize; i++){
      this.bands.push(this.ac.createBiquadFilter());
      this.bands[i].type = 'peaking';
      this.bands[i].frequency.value = i*3150;
      this.bands[i].Q.value = 5;
      this.toggle = true;
      if (i>0){
        this.bands[i-1].connect(this.bands[i]);
      }
    }
    this.input.connect(this.bands[0]);
    this.bands[_eqsize-1].connect(this.output);
  };

  p5.EQ.prototype = Object.create(Effect.prototype);

  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };

  /**
   *  @{method} setBand Make adjustments to individual bands of the EQ
   *
   *  @{param} band {number} Band to be modified
   *  @{param} option {string} Modify function (toggle, mod, type);
   *  @{param} param1 {number} Set the frequency of a band w/ usage: "mod"
   *  @{param} param2 {number} Set the Q value (resonance) of a band w/usage: "mod"
   *  @{param} param1 {string} Set the type of the band filter w/ usage: "type"
   */
  p5.EQ.prototype.setBand = function (band, option, param1, param2) {
    if (option === "toggle") { 
      this.toggleBand(band);
    } else if (option === "mod") { 
      this.modBand(band, param1, param2);
      // console.log("gain");
    } else if (option === "type") { 
      this.bandType(band, param1); 
    } else {
      console.log("error");
    }
  };

  /**
   *  @{method} toggleBand Switch a band on or off
   *
   *  @{param} band {number} Band to be modified
   */
  p5.EQ.prototype.toggleBand = function (band) {

    this.bands[band].toggle = !this.bands[band].toggle;
    console.log(this.bands[band].toggle);
    this.bands[band].toggle ? this.bands[band].type = 'peaking': this.bands[band].type = 'allpass';
  };


  /**
   *  @{method} modBand Change the parameters of a band filter
   *
   *  @{param} band {number} Band to be modified
   *  @{param} vol {number} Gain value, range: -40 to 40
   *  @{param} freq {number} Frequency value, range: 0 to 22050
   */
  p5.EQ.prototype.modBand = function (band, vol, freq) {
    // this.bands[band].biquad.gain.value = vol;
    if (vol) {this.bands[band].gain.value = vol;}

    if (freq) {this.bands[band].frequency.value = freq;}
  };



  /**
   *  @{method} bandType Change the type of a band 
   *
   *  @{param} band {number} Band to be modified
   *  @{param} type {string} Type of filter, accepted inputs 
   *  are those of the Web Audio Node BiquadFilter: 
   *    "lowpass", "highpass", "bandpass", 
   *    "lowshelf", "highshelf", "peaking", "notch",
   *    "allpass". 
   */
  p5.EQ.prototype.bandType = function (band, type) {

    // this.bannds[band].setType(type);
    this.bands[band].type = type;

  };

  p5.EQ.prototype.dispose = function (argument) {
    Effect.prototype.dispose.apply(this);

    for (var i = 0; i<bands.length; i++){
      this.bands[i].disconnect();
      this.bands[i] = undefined;
    }
    delete this.bands;
   
  }

});
