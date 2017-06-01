define(function (require) {
	'use strict';

	var p5sound = require('master');

	p5.Effect = function() {
		//everything points to the same audiocontext
		this.type = type;
		
		this.ac = p5sound.audiocontext;

		//wrap each node in gain nodes
		this.input = this.ac.createGain();
		this.output = this.ac.createGain();

		this.dry = this.ac.createGain();
		this.wet = this.ac.createGain();


		// this.input.connect(this.output);
		//connect input to wet and dry gain nodes
		// this.input.connect(this.dry);
		// this.input.connect(this.wet);

		// //connect wet and dry gain nodes to output
		// this.wet.connect(this.output);
		// this.dry.connect(this.output);

		this.input.connect(this.output);

		//connects to audiocontext destination
		this.connect();

		p5sound.soundArray.push(this);
	};


	p5.Effect.prototype.connect = function (unit) {
		var u = unit || p5.soundOut.input;
		this.output.connect(u.input ? u.input : u);
	};

	p5.Effect.prototype.disconnect = function() {
		this.output.disconnect();
	};

	p5.Effect.prototype.dispose = function() {
		var index = p5sound.soundArray.indexOf(this);
		p5sound.soundArray.splice(index, 1);

		this.input.disconnect();
		this.input = undefined;

		this.output.disconnect();
		this.output = undefined;
	};


	//effects necessary for all effects


	// //set up the connection to src and output
	// p5.Effect.prototype.process = function(src, amt) {
	// 	src.connect(this.input);

	//effects necessary for all effects


	// //set up the connection to src and output
	// p5.Effect.prototype.process = function(src, amt) {
	// 	src.connect(this.input);

	// 	//set the wetdry value
	// 	//this.wetdry(amt);
	// };

/*
	//sets wet dry value, input double between 0 and 1
	p5.Effect.prototype.wetdry = function(value) {
		//eventually implement cross fading like Tone.js

		//for now

		this.dry.value = 1-value;
		this.wet.value = 1;
	};
*/
	//could link together a bunch of nodes
	//TODO: find out how to have an open ended number of arguments
	// p5.Effect.prototype.chain = function(...nodes){
		
	// 	put arg list into array
	// 	this.output.connect(nodes[i])
		
	// 	for each, 
	// 		nodes[i].connect(nodes[i+1])
		
	// 	this.output.connect(nodes[0]);
	// 	for (i = 1; i<nodes.length; i++){
	// 		nodes[i-1].connect(nodes[i]);
	// 	}

	// };



});







