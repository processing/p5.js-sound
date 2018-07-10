var sloop;
var pentatonic_scale = ['A','C','D','E','G'];
var pitchClass_map = {'A':0,'C':1,'D':2,'E':3,'G':4};
var numOctaves = 6;
var baseOctave = 2;
var heightLevel;
var system;

var cells = [];
var cellWidth, cellHeight;
var numTimeSteps = 16;
var numPitches = 12;

function setup() {
  createCanvas(720, 400);
  // Create a synth to make sound with
  synth = new p5.PolySynth();
  // Create SoundLoop with 8th-note-long loop interval
  sloop = new p5.SoundLoop(soundLoop, "8n");
  sloop.bpm = 80; // 80 beats per minute

  cellWidth = width / numTimeSteps;
  cellHeight = height / numPitches;
  for (var i=0; i<numTimeSteps; i++) {
    for (var j=0; j<numPitches; j++) {
      var x = i*cellWidth;
      var y = j*cellHeight;
      cells.push(new Cell(createVector(x, y)));
    }
  }
}

function draw() {
  background(255);
  for (var i=0; i<cells.length; i++) {
    cells[i].checkIfHovered();
    cells[i].display();
  }

  // // Get mouse height level
  // stroke(255, 100);
  // heightLevel = round(numOctaves * (height - mouseY) / height);
  // line(0, height - heightLevel*height/numOctaves, 
  //   width, height - heightLevel*height/numOctaves);
  
  // // Play/pause controls
  // fill(255);
  // textAlign(CENTER, CENTER);
  // if (sloop.isPlaying) text('Click to Pause', width/2, height/2);
  // else text('Click to Play', width/2, height/2);
}

function soundLoop(cycleStartTime) {
  // Pick a random note, note octave based on mouse height
  var pitchClass = random(pentatonic_scale);
  var octave = baseOctave + heightLevel;
  var currentNote = pitchClass + str(octave);
  // Play sound
  var velocity = 1; // Between 0-1
  quaverSeconds = this._convertNotation('8n'); // 8th note = quaver duration
  synth.play(currentNote, velocity, cycleStartTime, quaverSeconds);
  // Add a particle to visualize the note
  var pitchClassIndex = pentatonic_scale.indexOf(pitchClass);
  var xpos = width / (pentatonic_scale.length * 2) + pitchClassIndex * width / pentatonic_scale.length;
  var ypos = height - heightLevel * height / numOctaves;
  system.addParticle(xpos, ypos);
}

function mouseClicked() {
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    sloop.start();
  }
}

var Cell = function(position) {
  this.padding = 2;
  this.position = position.copy();
  this.width = cellWidth - 2*this.padding;
  this.height = cellHeight - 2*this.padding;
  this.color = [255, random(255), random(200)];

  this.hovered = false;
  this.hoverColor = [240, 240, 240];

  this.pitch = 60;
}

Cell.prototype.display = function() {
  noStroke();
  if (this.hovered) {
    fill(this.hoverColor[0], this.hoverColor[1], this.hoverColor[2]);
  } else {
    fill(this.color[0], this.color[1], this.color[2]);
  }
  rect(this.position.x + this.padding, this.position.y + this.padding, this.width, this.height);
}

Cell.prototype.checkIfHovered = function() {
  var xMin = this.position.x + this.padding;
  var xMax = xMin + this.width;
  var yMin = this.position.y + this.padding;
  var yMax = yMin + this.height;
  if ((mouseX > xMin && mouseX < xMax) && (mouseY > yMin && mouseY < yMax)) {
    this.hovered = true;
  } else {
    this.hovered = false;
  }
}

// // A simple Particle class
// var Particle = function(position) {
//   this.acceleration = createVector(0, 0.1);
//   this.velocity = createVector(random(-1, 1), random(-3, -1));
//   this.position = position.copy();
//   this.lifespan = 255;
//   this.color = [random(255), random(255), random(255)];
// };

// Particle.prototype.run = function() {
//   this.update();
//   this.display();
// };

// // Method to update position
// Particle.prototype.update = function(){
//   this.velocity.add(this.acceleration);
//   this.position.add(this.velocity);
//   this.lifespan -= 2;
// };

// // Method to display
// Particle.prototype.display = function() {
//   noStroke();
//   fill(this.color[0], this.color[1], this.color[2], this.lifespan);
//   ellipse(this.position.x, this.position.y, 12, 12);
// };

// // Is the particle still useful?
// Particle.prototype.isDead = function(){
//   return this.lifespan < 0;
// };

// var ParticleSystem = function(position) {
//   this.origin = position.copy();
//   this.particles = [];
// };

// ParticleSystem.prototype.addParticle = function(xpos, ypos) {
//   this.particles.push(new Particle(createVector(xpos, ypos)));
// };

// ParticleSystem.prototype.run = function() {
//   for (var i = this.particles.length-1; i >= 0; i--) {
//     var p = this.particles[i];
//     p.run();
//     if (p.isDead()) {
//       this.particles.splice(i, 1);
//     }
//   }
// };
