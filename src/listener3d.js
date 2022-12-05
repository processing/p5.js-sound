import p5sound from './main';

//  /**
//   * listener is a class that can construct both a Spatial Panner
//   * and a Spatial Listener. The panner is based on the
//   * Web Audio Spatial Panner Node
//   * https://www.w3.org/TR/webaudio/#the-listenernode-interface
//   * This panner is a spatial processing node that allows audio to be positioned
//   * and oriented in 3D space.
//   *
//   * The Listener modifies the properties of the Audio Context Listener.
//   * Both objects types use the same methods. The default is a spatial panner.
//   *
//   * <code>p5.Panner3D</code> - Constructs a Spatial Panner<br/>
//   * <code>p5.Listener3D</code> - Constructs a Spatial Listener<br/>
//   *
//   * @class listener
//   * @constructor
//   * @return {Object} p5.Listener3D Object
//   *
//   * @param {Web Audio Node} listener Web Audio Spatial Panning Node
//   * @param {AudioParam} listener.panningModel "equal power" or "HRTF"
//   * @param {AudioParam} listener.distanceModel "linear", "inverse", or "exponential"
//   * @param {String} [type] [Specify construction of a spatial panner or listener]
//   */

class Listener3D {
  constructor(type) {
    this.ac = p5sound.audiocontext;
    this.listener = this.ac.listener;
  }

  //  /**
  //   * Connect an audio source
  //   * @param  {Object} src Input source
  //   */
  process(src) {
    src.connect(this.input);
  }
  //  /**
  //   * Set the X,Y,Z position of the Panner
  //   * @param  {[Number]} xVal
  //   * @param  {[Number]} yVal
  //   * @param  {[Number]} zVal
  //   * @param  {[Number]} time
  //   * @return {[Array]}      [Updated x, y, z values as an array]
  //   */
  position(xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.listener.positionX.value,
      this.listener.positionY.value,
      this.listener.positionZ.value,
    ];
  }

  //  /**
  //   * Getter and setter methods for position coordinates
  //   * @return {Number}      [updated coordinate value]
  //   */
  positionX(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.positionX.value = xVal;
      this.listener.positionX.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.positionX.linearRampToValueAtTime(
        xVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (xVal) {
      xVal.connect(this.listener.positionX);
    }
    return this.listener.positionX.value;
  }
  positionY(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.positionY.value = yVal;
      this.listener.positionY.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.positionY.linearRampToValueAtTime(
        yVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (yVal) {
      yVal.connect(this.listener.positionY);
    }
    return this.listener.positionY.value;
  }
  positionZ(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.positionZ.value = zVal;
      this.listener.positionZ.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.positionZ.linearRampToValueAtTime(
        zVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (zVal) {
      zVal.connect(this.listener.positionZ);
    }
    return this.listener.positionZ.value;
  }

  // cannot define method when class definition is commented
  //  /**
  //   * Overrides the listener orient() method because Listener has slightly
  //   * different params. In human terms, Forward vectors are the direction the
  //   * nose is pointing. Up vectors are the direction of the top of the head.
  //   *
  //   * @method orient
  //   * @param  {Number} xValF  Forward vector X direction
  //   * @param  {Number} yValF  Forward vector Y direction
  //   * @param  {Number} zValF  Forward vector Z direction
  //   * @param  {Number} xValU  Up vector X direction
  //   * @param  {Number} yValU  Up vector Y direction
  //   * @param  {Number} zValU  Up vector Z direction
  //   * @param  {Number} time
  //   * @return {Array}       All orienation params
  //   */
  orient(xValF, yValF, zValF, xValU, yValU, zValU, time) {
    if (arguments.length === 3 || arguments.length === 4) {
      time = arguments[3];
      this.orientForward(xValF, yValF, zValF, time);
    } else if (arguments.length === 6 || arguments === 7) {
      this.orientForward(xValF, yValF, zValF);
      this.orientUp(xValU, yValU, zValU, time);
    }

    return [
      this.listener.forwardX.value,
      this.listener.forwardY.value,
      this.listener.forwardZ.value,
      this.listener.upX.value,
      this.listener.upY.value,
      this.listener.upZ.value,
    ];
  }

  orientForward(xValF, yValF, zValF, time) {
    this.forwardX(xValF, time);
    this.forwardY(yValF, time);
    this.forwardZ(zValF, time);

    return [
      this.listener.forwardX,
      this.listener.forwardY,
      this.listener.forwardZ,
    ];
  }

  orientUp(xValU, yValU, zValU, time) {
    this.upX(xValU, time);
    this.upY(yValU, time);
    this.upZ(zValU, time);

    return [this.listener.upX, this.listener.upY, this.listener.upZ];
  }
  //  /**
  //   * Getter and setter methods for orient coordinates
  //   * @return {Number}      [updated coordinate value]
  //   */
  forwardX(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.forwardX.value = xVal;
      this.listener.forwardX.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.forwardX.linearRampToValueAtTime(
        xVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (xVal) {
      xVal.connect(this.listener.forwardX);
    }
    return this.listener.forwardX.value;
  }
  forwardY(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.forwardY.value = yVal;
      this.listener.forwardY.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.forwardY.linearRampToValueAtTime(
        yVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (yVal) {
      yVal.connect(this.listener.forwardY);
    }
    return this.listener.forwardY.value;
  }
  forwardZ(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.forwardZ.value = zVal;
      this.listener.forwardZ.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.listener.forwardZ.linearRampToValueAtTime(
        zVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (zVal) {
      zVal.connect(this.listener.forwardZ);
    }
    return this.listener.forwardZ.value;
  }
  upX(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.upX.value = xVal;
      this.listener.upX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upX.linearRampToValueAtTime(
        xVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (xVal) {
      xVal.connect(this.listener.upX);
    }
    return this.listener.upX.value;
  }
  upY(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.upY.value = yVal;
      this.listener.upY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upY.linearRampToValueAtTime(
        yVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (yVal) {
      yVal.connect(this.listener.upY);
    }
    return this.listener.upY.value;
  }
  upZ(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.upZ.value = zVal;
      this.listener.upZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upZ.linearRampToValueAtTime(
        zVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (zVal) {
      zVal.connect(this.listener.upZ);
    }
    return this.listener.upZ.value;
  }
}

export default Listener3D;
