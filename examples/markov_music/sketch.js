var synth;
var velocity = 0.7; // From 0-1
var baseNote = 60;
var keyOrder = "ASDFGHJKL";
var keyScale = [0,2,4,5,7,9,11,12,14];
var keyStates = [0,0,0,0,0,0,0,0,0];

var sloop;
var transition_table = {};
var nodes = [];
var graph;
var latestNodeId;
var playing = false;
var timeQuantization = 0.1;

function setup() {
  createCanvas(700, 400);
  frameRate(20);

  synth = new p5.PolySynth();

  graph = new Graph();
  
  sloop = new p5.SoundLoop(soundLoop, "16n");
  mloop = new p5.SoundLoop(metronomeLoop, timeQuantization);
  mloop.start();
  
  playPauseButton = createButton("Play / Pause");
  playPauseButton.position(20, 20);
  playPauseButton.mousePressed(togglePlayPause);
}

function draw() {
  background(255);
  // Draw edges
  graph.drawEdges();
  // Draw nodes
  for (var i=0; i<graph.nodes.length; i++) {
    graph.nodes[i].bounceOnBoundaries();
    graph.nodes[i].update();
    graph.nodes[i].display();
  }
}

function soundLoop(cycleStartTime) {
  // Transition to a random new node
  latestNodeId = random(graph.edges[latestNodeId]);
  // Play the sound of this node
  var midiNoteNumber = graph.nodes[latestNodeId].pitch;
  var freq = midiToFreq(midiNoteNumber);
  var duration = graph.nodes[latestNodeId].duration * timeQuantization;
  synth.play(freq, velocity, cycleStartTime, duration);
  this.interval = duration;
}

function metronomeLoop(cycleStartTime) {
  // This loop measures the duration of each keypress
  // key-down durations are stored in the keyStates array
  for (var i=0; i<keyStates.length; i++) {
    if (keyStates[i] > 0) {
      keyStates[i] = keyStates[i] + 1;
    }
  }
}

function keyPressed() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Activate key state
    keyStates[keyIndex] = 1;
    // Play synth
    var midiNoteNumber = baseNote + keyScale[keyIndex]; // 0-127; 60 is Middle C (C4)
    var freq = midiToFreq(midiNoteNumber);
    synth.noteAttack(freq, velocity, 0);
  }
}

function keyReleased() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Stop synth
    midiNoteNumber = baseNote + keyScale[keyIndex]; // 0-127; 60 is Middle C (C4)
    freq = midiToFreq(midiNoteNumber);
    synth.noteRelease(freq, 0);
    // Register node
    graph.registerNewNode(midiNoteNumber, keyStates[keyIndex]);
    // Reset key state
    keyStates[keyIndex] = 0;
  }
}

function togglePlayPause() {
  if (sloop.isPlaying) {
    sloop.stop();
  } else {
    sloop.start();
  }
}


// Class for a single node
// characterized by ID, pitch and duration of the note it represents
function Node(id, pitch, duration) {
  this.id = id;
  this.color = [255, 0, 100];
  this.diameter = 10;
  this.position = createVector(width/2 + random(-100,100), height/2 + random(-100,100));
  this.velocity = createVector(random(-1,1), random(-1,1));
  this.pitch = pitch;
  this.duration = duration;
}
Node.prototype.isSimilar = function(node) {
  var squaredDist = (this.pitch - node.pitch)**2 + (this.duration - node.duration)**2;
  if (squaredDist == 0) {
    return true;
  } else {
    return false;
  }
};
Node.prototype.applyForce = function(force) {
  var f = p5.Vector.div(force,this.diameter);
  this.acceleration.add(f);
};
Node.prototype.update = function() {
  // Velocity changes according to acceleration
  this.velocity.add(this.acceleration);
  // position changes by velocity
  this.position.add(this.velocity);
};
Node.prototype.display = function() {
  noStroke();
  // Highlight latest node
  if (this.id == latestNodeId) { 
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.position.x,this.position.y,this.diameter,this.diameter);
  } else {
    fill(200);
    ellipse(this.position.x,this.position.y,this.diameter,this.diameter);
  }
};
Node.prototype.bounceOnBoundaries = function() {
  if (this.position.x >= width || this.position.x <= 0) {
    this.velocity.x *= -1;
    this.position.x = constrain(this.position.x, 0, width);
  }
  if (this.position.y >= height || this.position.y <= 0) {
    this.velocity.y *= -1;
    this.position.y = constrain(this.position.y, 0, height);
  }
};


// Graph data structure code adapted from 
// http://blog.benoitvallon.com/data-structures-in-javascript/the-graph-data-structure/
function Graph() {
  this.nodes = [];
  this.nodeIds = [];
  this.edges = [];
  this.numberOfEdges = 0;
}
Graph.prototype.findNode = function(node) {
  for (var i=0; i<this.nodes.length; i++) {
    if (node.isSimilar(this.nodes[i])) {
      return i;
    }
  }
  return -1; // Not found
};
Graph.prototype.registerNewNode = function(midiNoteNumber, duration) {
  var node = new Node(0, midiNoteNumber, duration);
  var nodeId = graph.findNode(node);
  if (nodeId == -1) { // If necessary, create the node
    nodeId = this.nodes.length;
    this.addNode(node);
  }
  node.id = nodeId;
  if (latestNodeId != null) { // On initialization it will be null
    // Add an edge from the previous node to this one
    this.addEdge(latestNodeId, nodeId);
  }
  // Update the latest node ID
  latestNodeId = nodeId;
};
Graph.prototype.addNode = function(node) {
  var nodeId = this.nodes.length;
  this.nodeIds.push(nodeId);
  this.nodes.push(node);
  this.edges[nodeId] = [];
};
Graph.prototype.addEdge = function(nodeId1, nodeId2) {
  this.edges[nodeId1].push(nodeId2);
  this.numberOfEdges++;
};
Graph.prototype.drawEdges = function() {
  // Draw all edges leading away from this node
  strokeWeight(1);
  for (var i=0; i<graph.edges.length; i++) {
    var startNode = i;
    if (startNode == latestNodeId) { // Highlight the latest node's edges
      stroke(graph.nodes[startNode].color[0], graph.nodes[startNode].color[1], graph.nodes[startNode].color[2], 100);
    } else {
      stroke(200, 100);
    }
    for (var j=0; j<graph.edges[i].length; j++) {
      var endNode = graph.edges[i][j];
      line(graph.nodes[startNode].position.x, graph.nodes[startNode].position.y, graph.nodes[endNode].position.x, graph.nodes[endNode].position.y);
    }
  }
};