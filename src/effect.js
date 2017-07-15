'use strict';
define(function (require) {

	var p5sound = require('master');
	var CrossFade = require('Tone/component/CrossFade');

	/**
	 * Effect is a base class for audio effects in p5. <br>
	 * This module handles the nodes and methods that are 
	 * common and useful for current and future effects.
	 *
	 * @class  p5.Effect
	 * @constructor
	 *
	 * @param {Object} [ac]   Reference to the audio context of the p5 object
	 * @param {WebAudioNode} [input]  Gain Node effect wrapper
	 * @param {WebAudioNode} [output] Gain Node effect wrapper
	 * @param {Object} [_drywet]   Tone.JS CrossFade node (defaults to value: 1)
	 * @param {WebAudioNode} [wet]  Effect that extend this class should connect
	 *                              to this this gain node, so that dry and wet 
	 *                              signals are mixed properly.
	 */
	p5.Effect = function() {
		this.ac = p5sound.audiocontext;

		this.input = this.ac.createGain();
		this.output = this.ac.createGain();

		/**
		 *	The p5.Effect class is built
		 * 	using Tone.js CrossFade
		 * 	@private
		 */
		this._drywet = new CrossFade(1);

		/**
		 *	In classes that extend
		 *	p5.Effect, connect effect nodes
		 *	to the wet parameter
		 */
		this.wet = this.ac.createGain();

		this.input.connect(this._drywet.a);
		this.wet.connect(this._drywet.b);
		this._drywet.connect(this.output);

		this.connect();

		//Add to the soundArray
		p5sound.soundArray.push(this);
	};

	/**
	 *  Set the output volume of the filter.
	 *  
	 *  @method  amp
	 *  @param {Number} [vol] amplitude between 0 and 1.0
	 *  @param {Number} [rampTime] create a fade that lasts until rampTime 
	 *  @param {Number} [tFromNow] schedule this event to happen in tFromNow seconds
	 */
	p5.Effect.prototype.amp = function(vol, rampTime, tFromNow){
	  var rampTime = rampTime || 0;
	  var tFromNow = tFromNow || 0;
	  var now = p5sound.audiocontext.currentTime;
	  var currentVol = this.output.gain.value;
	  this.output.gain.cancelScheduledValues(now);
	  this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow + .001);
	  this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime + .001);
	};

	/**
	 *	Link effects together in a chain	
	 *	Example usage: filter.chain(reverb, delay, panner);
	 *	May be used with an open-ended number of arguments
	 *
	 *	@method chain 
     *  @param {Object} [arguments]  Chain together multiple sound objects	
	 */		
	p5.Effect.prototype.chain = function(){
		if (arguments.length>0){
			this.output.connect(arguments[0]);
			for(var i=1;i<arguments.length; i+=1){
				arguments[i-1].connect(arguments[i]);
			}
		}
		return this;
	};

	/**
	 *	Adjust the dry/wet value.	
	 *	
	 *	@method drywet
	 *	@param {Number} [fade] The desired drywet value (0 - 1.0)
	 */
	p5.Effect.prototype.drywet = function(fade){
		if (typeof fade !=="undefined"){	
			this._drywet.fade.value = fade
		}
		return this._drywet.fade.value;
	};

	/**
	 *	Send output to a p5.js-sound or Web Audio Node	
	 *	
	 *	@method connect 
	 *	@param {Object} unit 
	 */
	p5.Effect.prototype.connect = function (unit) {
		var u = unit || p5.soundOut.input;
		this.output.connect(u.input ? u.input : u);
	};

	/**
	 *	Disconnect all output.	
	 *	
	 *	@method disconnect 
	 */
	p5.Effect.prototype.disconnect = function() {
		this.output.disconnect();
	};

	p5.Effect.prototype.dispose = function() {
		// remove refernce form soundArray
		var index = p5sound.soundArray.indexOf(this);
		p5sound.soundArray.splice(index, 1);

		this.input.disconnect();
		this.input = undefined;

		this.output.disconnect();
		this.output = undefined;

		this.ac = undefined;
	};

	return p5.Effect;

});
