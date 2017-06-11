define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');

	p5.Compressor = function() {
		Effect.call(this);

		this.compressor = this.ac.createDynamicsCompressorNode();

	};
	p5.Compressor.prototype = Object.create(Effect.prototype);

	p5.Compressor.prototype.process = function(src,threshold,wetdry) {
		src.connect(this.input);
		this.set(threshold,wetdry);
	};

	p5.Compressor.prototype.dispose = function() {
		Effec.prototype.dispose.apply(this);

		this.compressor.disconnect();
		this.compressor = undefined;
	}
});