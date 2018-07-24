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
var sphereRadius = 200;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(15);

  synth = new p5.PolySynth();

  graph = new Graph();
  
  sloop = new p5.SoundLoop(soundLoop, "16n");
  mloop = new p5.SoundLoop(metronomeLoop, timeQuantization);
  mloop.start();
  
  playPauseButton = createButton("Play / Pause");
  playPauseButton.position(20, 20);
  playPauseButton.mousePressed(togglePlayPause);
}

function metronomeLoop(cycleStartTime) {
  for (var i=0; i<keyStates.length; i++) {
    if (keyStates[i] > 0) {
      keyStates[i] = keyStates[i] + 1;
      console.log(keyStates[i]);
    }
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

function togglePlayPause() {
  if (sloop.isPlaying) {
    sloop.stop();
  } else {
    sloop.start();
  }
}

function keyPressed() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Update key state
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
    // Update key state
    keyStates[keyIndex] = 0;
  }
}

function draw() {
  background(255);
  noStroke();
  fill(245);
  ellipse(width/2, height/2, sphereRadius*2, sphereRadius*2);

  // Draw edges
  for (var i=0; i<graph.edges.length; i++) {
    var startNode = i;
    if (startNode == latestNodeId) {
      strokeWeight(1);
      stroke(graph.nodes[startNode].color[0], graph.nodes[startNode].color[1], graph.nodes[startNode].color[2]);
    } else {
      strokeWeight(1);
      stroke(200, 100);
    }
    for (var j=0; j<graph.edges[i].length; j++) {
      var endNode = graph.edges[i][j];
      line(graph.nodes[startNode].position.x, graph.nodes[startNode].position.y, graph.nodes[endNode].position.x, graph.nodes[endNode].position.y);
    }
  }

  // Draw nodes
  for (var i=0; i<graph.nodes.length; i++) {
    graph.nodes[i].checkEdges();
    graph.nodes[i].update();
    graph.nodes[i].display();
  }
}

function Node(id, pitch, duration) {
  this.id = id;
  this.color = [255, 0, 100];
  this.diameter = 10;
  this.position = createVector(width/2 + random(-100,100), height/2 + random(-100,100));
  this.velocity = createVector(random(-1,1), random(-1,1));
  this.pitch = pitch;
  this.duration = duration;
}
Node.prototype.distance = function(node) {
  var squaredDist = (this.pitch - node.pitch)**2 + (this.duration - node.duration)**2;
  return squaredDist;
}
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
Node.prototype.checkEdges = function() {
  var distanceFromCenter = sqrt((this.position.y - height/2)**2 + (this.position.x - width/2)**2);
  if (distanceFromCenter > sphereRadius) {
    this.velocity.x *= -1;
    this.velocity.y *= -1;
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
    if (abs(node.distance(this.nodes[i])) == 0) {
      return i;
    }
  }
  return -1; // Not found, add to end of array
}
Graph.prototype.registerNewNode = function(midiNoteNumber, duration) {
  var node = new Node(0, midiNoteNumber, duration);
  var nodeId = graph.findNode(node);
  // If necessary, create the node
  if (nodeId == -1) {
    nodeId = this.nodes.length;
    this.addNode(node);
  }
  node.id = nodeId;
  // Add an edge from the previous node to this one
  if (latestNodeId != null) { // On the first start it will be null
    this.addEdge(latestNodeId, nodeId);
  }
  latestNodeId = nodeId;
};
Graph.prototype.addNode = function(node) {
  var nodeId = this.nodes.length;
  this.nodeIds.push(nodeId);
  this.nodes.push(node);
  this.edges[nodeId] = [];
}
Graph.prototype.addEdge = function(nodeId1, nodeId2) {
  this.edges[nodeId1].push(nodeId2);
  this.numberOfEdges++;
};