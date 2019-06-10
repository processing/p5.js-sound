'use strict'

define(function (require) {
  var p5sound = require('master');
  var Effect = require('effect');

  /**
   * Panner3D is based on the <a title="Web Audio Panner docs"  href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
   * Web Audio Spatial Panner Node</a>.
   * This panner is a spatial processing node that allows audio to be positioned
   * and oriented in 3D space.
   *
   * The position is relative to an <a title="Web Audio Listener docs" href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/AudioListener">
   * Audio Context Listener</a>, which can be accessed
   * by <code>p5.soundOut.audiocontext.listener</code>
   *
   *
   * @class p5.Panner3D
   * @constructor
   */
	p5.Panner3D = function() {
      Effect.call(this);

      /**
       *  <a title="Web Audio Panner docs"  href=
       *  "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
       *  Web Audio Spatial Panner Node</a>
       *
       *  Properties include
       *    -  <a title="w3 spec for Panning Model"
       *    href="https://www.w3.org/TR/webaudio/#idl-def-PanningModelType"
       *    >panningModel</a>: "equal power" or "HRTF"
       *    -  <a title="w3 spec for Distance Model"
       *    href="https://www.w3.org/TR/webaudio/#idl-def-DistanceModelType"
       *    >distanceModel</a>: "linear", "inverse", or "exponential"
       *
       *  @property {AudioNode} panner
       *
       */
      this.panner = this.ac.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'linear';
      this.panner.connect(this.output);
      this.input.connect(this.panner);
	};

  p5.Panner3D.prototype = Object.create(Effect.prototype);


  /**
   * Connect an audio sorce
   *
   * @method  process
   * @for p5.Panner3D
   * @param  {Object} src Input source
   */
  p5.Panner3D.prototype.process = function(src) {
    src.connect(this.input);
  }
  /**
   * Set the X,Y,Z position of the Panner
   * @method set
   * @for p5.Panner3D
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.set = function(xVal, yVal, zVal, time) {
    this.positionX(xVal,time);
    this.positionY(yVal,time);
    this.positionZ(zVal,time);
    return [this.panner.positionX.value,
              this.panner.positionY.value,
              this.panner.positionZ.value];
  };

  /**
   * Getter and setter methods for position coordinates
   * @method positionX
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionY
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionZ
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.positionX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.positionX.value = xVal;
      this.panner.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.positionX);
    }
    return this.panner.positionX.value;
  };
  p5.Panner3D.prototype.positionY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.positionY.value = yVal;
      this.panner.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.positionY);
    }
    return this.panner.positionY.value;
  };
  p5.Panner3D.prototype.positionZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.positionZ.value = zVal;
      this.panner.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.positionZ);
    }
    return this.panner.positionZ.value;
  };

  /**
   * Set the X,Y,Z position of the Panner
   * @method  orient
   * @for p5.Panner3D
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.orient = function(xVal, yVal, zVal, time) {
  this.orientX(xVal,time);
  this.orientY(yVal,time);
  this.orientZ(zVal,time);
  return [this.panner.orientationX.value,
          this.panner.orientationY.value,
          this.panner.orientationZ.value];
  };

  /**
   * Getter and setter methods for orient coordinates
   * @method orientX
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientY
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientZ
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.orientX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.orientationX.value = xVal;
      this.panner.orientationX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.orientationX);
    }
    return this.panner.orientationX.value;
  };
  p5.Panner3D.prototype.orientY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.orientationY.value = yVal;
      this.panner.orientationY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.orientationY);
    }
    return this.panner.orientationY.value;
  };
  p5.Panner3D.prototype.orientZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.orientationZ.value = zVal;
      this.panner.orientationZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.orientationZ);
    }
    return this.panner.orientationZ.value;
  };

  /**
   * Set the rolloff factor and max distance
   * @method  setFalloff
   * @for p5.Panner3D
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]
   */
  p5.Panner3D.prototype.setFalloff = function(maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  };
  /**
   * Maxium distance between the source and the listener
   * @method  maxDist
   * @for p5.Panner3D
   * @param  {Number} maxDistance
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.maxDist = function(maxDistance){
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  };

  /**
   * How quickly the volume is reduced as the source moves away from the listener
   * @method  rollof
   * @for p5.Panner3D
   * @param  {Number} rolloffFactor
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.rolloff = function(rolloffFactor){
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  };

  p5.Panner3D.dispose = function() {
    Effect.prototype.dispose.apply(this);
    if (this.panner) {
      this.panner.disconnect();
      delete this.panner;
    }
  };

  return p5.Panner3D;

});
