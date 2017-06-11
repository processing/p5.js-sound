define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');

	p5.Compressor = function() {
		Effect.call(this);
	};
	p5.Compressor.prototype = Object.create(Effect.prototype);
});