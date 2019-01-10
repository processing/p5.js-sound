/**
 *  Example: Markov music
 *  Demonstrates the use of Markov chains to model musical sequences.
 * 
 *  The user adds notes to the Markov chain by playing notes ASDFGHJKL
 *  on the keyboard. Every note event (note on and note off) is registered
 *  as a new node in the graph, and the graph records all transitions 
 *  between note events as edges along the graph.
 * 
 *  During playback mode, the algorithm simply traverses the graph randomly,
 *  playing notes based on the nodes upon which it traverses.
 * 
 *  The Markov chain (graph) is visualized as a standard network of nodes, 
 *  with transitions represented by edges between nodes. The current/latest 
 *  node as well as the edges of its previously recorded transitions are 
 *  highlighted.
 */

// Music
var synth;
var velocity = 0.7; // From 0-1
var baseNote = 60;
var keyOrder = "ASDFGHJKL";
var keyScale = [0,2,4,5,7,9,11,12,14];
var keyStates = [0,0,0,0,0,0,0,0,0];
// Markov Chain
var graph;
var latestNodeId;
// Playback SoundLoops
var sloop;
var playing = false;
var secondsPerTick = 0.1;
var prevEventMillis = 0;
var timeQuantizationStep = 100; // Quantize to 10 milliseconds
var maxDuration = 5000;
var longestDurationSoFar = timeQuantizationStep;
// Colors
var DEFAULT_NODE_COLOR = [85, 120, 138];
var ACTIVE_NODE_COLOR = [205, 0, 100];

function setup() {
  createCanvas(720, 400);
  frameRate(15);
  angleMode(DEGREES);

  graph = new Graph();
  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, 0.1);
  
  playPauseButton = createButton("Play / Pause");
  playPauseButton.position(20, height-40);
  playPauseButton.mousePressed(togglePlayPause);

  prevEventMillis = millis();
}

function draw() {
  background(242, 221, 164);
  fill(163, 196, 188);
  rect(0, 0, width/2, height);
  // Draw edges
  graph.drawEdges();
  // Draw nodes
  for (var i=0; i<graph.nodes.length; i++) {
    graph.nodes[i].update();
    graph.nodes[i].display();
  }
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  // If there are no nodes, tell the users to play something
  if (graph.nodes.length == 0) {
    text("Press any of ASDFGHJKL to add notes to the Markov chain.", width/2, 20);
  }
  // If we are at the end of the chain, tell the users
  if (latestNodeId != null && graph.edges[latestNodeId].length == 0) {
    text("Reached end of Markov chain. Play a new note to add to chain.", width/2, 20);
    sloop.stop();
    synth.noteRelease(); // Release all notes
  }

  if (sloop.isPlaying) {
    text("Generating from chain...", width/2, height - 20);
  } else {
    text("PAUSED", width/2, height - 20);
  }
}

function soundLoop(cycleStartTime) {
  // Play the sound of this node
  var midiNoteNumber = graph.nodes[latestNodeId].pitch;
  var freq = midiToFreq(midiNoteNumber);
  var type = graph.nodes[latestNodeId].type;
  if (type == 1) {
    synth.noteAttack(freq, velocity, cycleStartTime);
  } else {
    synth.noteRelease(freq, cycleStartTime);
  }
  // Transition to a random new node
  if (graph.edges[latestNodeId].length) {
    latestNodeId = random(graph.edges[latestNodeId]);
  }
  // Wait for the timeFromPrevEvent of the new node
  var timeSincePrevEvent = graph.nodes[latestNodeId].timeSincePrevEvent / 1000; // Millis to seconds
  this.interval = max(timeSincePrevEvent, 0.01); // Cannot have interval of exactly 0
}

function keyPressed() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Play synth
    var midiNoteNumber = baseNote + keyScale[keyIndex]; // 0-127; 60 is Middle C (C4)
    var freq = midiToFreq(midiNoteNumber);
    synth.noteAttack(freq, velocity, 0);
    // Update time
    var timeSincePrevEvent = min(millis() - prevEventMillis, maxDuration);
    prevEventMillis = millis();
    var quantizedTimeSincePrevEvent = round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
    // Register node
    graph.registerNewNode(1, midiNoteNumber, quantizedTimeSincePrevEvent);
    // Activate key state
    keyStates[keyIndex] = 1;
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
    // Update time
    var timeSincePrevEvent = min(millis() - prevEventMillis, maxDuration);
    prevEventMillis = millis();
    var quantizedTimeSincePrevEvent = round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
    // Register node
    graph.registerNewNode(0, midiNoteNumber, quantizedTimeSincePrevEvent);
    // Reset key state
    keyStates[keyIndex] = 0;
    
    timeSincePrevEvent = 0;
  }
}

function togglePlayPause() {
  if (sloop.isPlaying) {
    sloop.stop();
    synth.noteRelease(); // Release all notes
  } else {
    sloop.start();
  }
}

// Class for a single node
// characterized by ID, pitch and timeSincePrevEvent of the note it represents
function Node(id, type, pitch, timeSincePrevEvent) {
  this.id = id;
  this.type = type; // 1 (note on) or 0 (note off)
  this.pitch = pitch;
  this.timeSincePrevEvent = timeSincePrevEvent;
  this.oscillateCounter = 0;

  var x = map(this.timeSincePrevEvent, 0, maxDuration/2, 0, width/2);
  if (type === 1) {
    x = width / 2 + x;
  } else {
    x = width / 2 - x;
  }
  var y = map(this.pitch, baseNote, baseNote + max(keyScale), height*0.9, height*0.1);
  this.center = createVector(x, y);
  this.position = createVector(x, y);

  this.color = ACTIVE_NODE_COLOR;
  this.diameter = map(this.timeSincePrevEvent, 0, maxDuration, 2, height/20);
}
Node.prototype.isSimilar = function(node) {
  if (this.type === node.type && this.pitch === node.pitch && this.duration === node.duration) {
    return true;
  } else {
    return false;
  }
};
Node.prototype.update = function() {
  var yAmplitude = height / 150;
  var xAmplitude = height / 300;
  this.position.y = this.center.y + (yAmplitude * sin(this.oscillateCounter));
  this.position.x = this.center.x + (xAmplitude * cos(this.oscillateCounter));
  this.oscillateCounter = this.oscillateCounter + 6;
};
Node.prototype.display = function() {
  noStroke();
  var color = DEFAULT_NODE_COLOR;
  if (this.id == latestNodeId) {
    // Highlight latest node
    color = this.color;
  }
  // Fill circle if note-on, stroke circle if note-off
  if (this.type == 1) {
    noStroke();
    fill(color[0], color[1], color[2]);
  } else {
    noFill();
    strokeWeight(2);
    stroke(color[0], color[1], color[2]);
  }
  ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
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
Graph.prototype.registerNewNode = function(type, midiNoteNumber, timeSincePrevEvent) {
  var node = new Node(0, type, midiNoteNumber, timeSincePrevEvent);
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
      stroke(DEFAULT_NODE_COLOR);
    }
    for (var j=0; j<graph.edges[i].length; j++) {
      var endNode = graph.edges[i][j];
      line(graph.nodes[startNode].position.x, graph.nodes[startNode].position.y, graph.nodes[endNode].position.x, graph.nodes[endNode].position.y);
    }
  }
};