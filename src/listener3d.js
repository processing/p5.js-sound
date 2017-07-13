'use strict'

define(function (require) {
  var p5sound = require('master');
  var Effect = require('effect');

  /**
   * Spatializer is a class that can construct both a Spatial Panner
   * and a Spatial Listener. The panner is based on the 
   * Web Audio Spatial Panner Node
   * https://www.w3.org/TR/webaudio/#the-spatializernode-interface
   * This panner is a spatial processing node that allows audio to be positioned
   * and oriented in 3D space. 
   *
   * The Listener modifies the properties of the Audio Context Listener. 
   * Both objects types use the same methods. The default is a spatial panner.
   *
   * <code>p5.Panner3D</code> - Constructs a Spatial Panner<br/>
   * <code>p5.Listener3D</code> - Constructs a Spatial Listener<br/>
   *
   * @class Spatializer
   * @constructor
   * @return {Object} p5.Listener3D Object
   *
   * @param {Web Audio Node} spatializer Web Audio Spatial Panning Node
   * @param {AudioParam} spatializer.panningModel "equal power" or "HRTF"
   * @param {AudioParam} spatializer.distanceModel "linear", "inverse", or "exponential"
   * @param {String} [type] [Specify construction of a spatial panner or listener]
   */
	p5.Listener3D = function(type) {

    // if (type==="listener") {

      this.ac = p5sound.audiocontext;
      this.listener = this.ac.listener;
	};


 

  /**
   * Connect an audio sorce
   * @param  {Object} src Input source
   */
  p5.Listener3D.prototype.process = function(src) {
    src.connect(this.input);
  }
  /**
   * Set the X,Y,Z position of the Panner
   * @param  {[Number]} xVal
   * @param  {[Number]} yVal
   * @param  {[Number]} zVal
   * @param  {[Number]} time
   * @return {[Array]}      [Updated x, y, z values as an array]
   */
  p5.Listener3D.prototype.position = function(xVal, yVal, zVal, time) {
    this.positionX(xVal,time);
    this.positionY(yVal,time);
    this.positionZ(zVal,time);
    return [this.spatializer.positionX.value, 
              this.spatializer.positionY.value,
              this.spatializer.positionZ.value];
  };

  /**
   * Getter and setter methods for position coordinates
   * @return {Number}      [updated coordinate value]
   */
  p5.Listener3D.prototype.positionX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.spatializer.positionX.value = xVal;
      this.spatializer.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.spatializer.positionX);
    }
    return this.spatializer.positionX.value;
  };
  p5.Listener3D.prototype.positionY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.spatializer.positionY.value = yVal;
      this.spatializer.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.spatializer.positionY);
    }
    return this.spatializer.positionY.value;
  };
  p5.Listener3D.prototype.positionZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.spatializer.positionZ.value = zVal;
      this.spatializer.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.spatializer.positionZ);
    }
    return this.spatializer.positionZ.value;
  };

  /**
   * [Overrides the Spatializer orient() method because Listener has slightly
   * different params. In human terms, Forward vectors are the direction the 
   * nose is pointing. Up vectors are the direction of the top of the head.
   * 
   * @param  {[Number]} xValF [Forward vector X direction]
   * @param  {[Number]} yValF [Forward vector Y direction]
   * @param  {[Number]} zValF [Forward vector Z direction]
   * @param  {[Number]} xValU [Up vector X direction]
   * @param  {[Number]} yValU [Up vector Y direction]
   * @param  {[Number]} zValU [Up vector Z direction]
   * @param  {[Number]} time  
   * @return {[Array]}       [All orienation params]
   */
  p5.Listener3D.prototype.orient = function(xValF, yValF, zValF, 
                                              xValU, yValU, zValU, time) {

  if (arguments.length === 3 || arguments.length === 4) {
    time = arguments[3];
    this.orientForward(xValF, yValF, zValF, time);
  } else if (arguments.length === 6 || arguments === 7) {
    this.orientForward(xValF, yValF, zValF);
    this.orientUp(xValU, yValU, zValU, time);
  }
  
  return [this.spatializer.forwardX.value, 
          this.spatializer.forwardY.value,
          this.spatializer.forwardZ.value,
          this.spatializer.upX.value,
          this.spatializer.upY.value,
          this.spatializer.upZ.value];
  };


  p5.Listener3D.prototype.orientForward = function(xValF, yValF, zValF, time) {
    this.forwardX(xValF,time);
    this.forwardY(yValF,time);
    this.forwardZ(zValF,time);

    return [this.spatializer.forwardX, 
            this.spatializer.forwardY,
            this.spatializer.forwardZ];
  };

  p5.Listener3D.prototype.orientUp = function(xValU, yValU, zValU, time) {
    this.upX(xValU,time);
    this.upY(yValU,time);
    this.upZ(zValU,time);

    return [this.spatializer.upX, 
            this.spatializer.upY,
            this.spatializer.upZ];
  };
  /**
   * Getter and setter methods for orient coordinates
   * @return {Number}      [updated coordinate value]
   */
  p5.Listener3D.prototype.forwardX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.spatializer.forwardX.value = xVal;
      this.spatializer.forwardX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.forwardX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.spatializer.forwardX);
    }
    return this.spatializer.forwardX.value;
  };
  p5.Listener3D.prototype.forwardY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.spatializer.forwardY.value = yVal;
      this.spatializer.forwardY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.forwardY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.spatializer.forwardY);
    }
    return this.spatializer.forwardY.value;
  };
  p5.Listener3D.prototype.forwardZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.spatializer.forwardZ.value = zVal;
      this.spatializer.forwardZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.forwardZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.spatializer.forwardZ);
    }
    return this.spatializer.forwardZ.value;
  };
  p5.Listener3D.prototype.upX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.spatializer.upX.value = xVal;
      this.spatializer.upX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.upX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.spatializer.upX);
    }
    return this.spatializer.upX.value;
  };
  p5.Listener3D.prototype.upY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.spatializer.upY.value = yVal;
      this.spatializer.upY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.upY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.spatializer.upY);
    }
    return this.spatializer.upY.value;
  };
  p5.Listener3D.prototype.upZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.spatializer.upZ.value = zVal;
      this.spatializer.upZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.upZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.spatializer.upZ);
    }
    return this.spatializer.upZ.value;
  };
  
  return p5.Listener3D;

});