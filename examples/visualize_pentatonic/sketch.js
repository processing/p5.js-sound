/**
 * Example of dynamic note-scheduling using the p5.SoundLoop.
 * 
 * This example produces random sequences of notes drawn from a
 * minor pentatonic scale, but allow the user to interact with
 * the composition by moving the cursor to change the octave
 * of the note palette.
 */

var sloop;
var pentatonic_scale = ['A', 'C', 'D', 'E', 'G'];
var pitchClass_map = { 'A': 0, 'C': 1, 'D': 2, 'E': 3, 'G': 4 };
var numOctaves = 5;
var baseOctave = 2;
var heightLevel;
var system;

function setup() {
  createCanvas(720, 400);
  // Particles to visualize notes
  system = new ParticleSystem(createVector(width / 2, 50));
  // Create a synth to make sound with
  synth = new p5.PolySynth();
  // Create SoundLoop repeating every 0.3s
  sloop = new p5.SoundLoop(soundLoop, 0.3);
}

function draw() {
  background(50);
  // Get mouse height level
  stroke(255, 100);
  heightLevel = round(numOctaves * (height - mouseY) / height);
  line(0, height - heightLevel * height / numOctaves,
    width, height - heightLevel * height / numOctaves);
  // Update particle system
  system.run();
  // Play/pause controls
  fill(255);
  textAlign(CENTER, CENTER);
  if (sloop.isPlaying) text('Click to Pause', width / 2, height / 2);
  else text('Click to Play', width / 2, height / 2);
}

function soundLoop(cycleStartTime) {
  // Pick a random note, note octave based on mouse height
  var pitchClass = random(pentatonic_scale);
  var octave = baseOctave + heightLevel;
  var currentNote = pitchClass + str(octave);
  // Play sound
  var velocity = 1; // Between 0-1
  var duration = this.interval;
  synth.play(currentNote, velocity, cycleStartTime, duration);
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

// A simple Particle class
var Particle = function (position) {
  this.acceleration = createVector(0, 0.1);
  this.velocity = createVector(random(-1, 1), random(-3, -1));
  this.position = position.copy();
  this.lifespan = 255;
  this.color = [random(255), random(255), random(255)];
};

Particle.prototype.run = function () {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  noStroke();
  fill(this.color[0], this.color[1], this.color[2], this.lifespan);
  ellipse(this.position.x, this.position.y, width / 30, width / 30);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  return this.lifespan < 0;
};

var ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function (xpos, ypos) {
  this.particles.push(new Particle(createVector(xpos, ypos)));
};

ParticleSystem.prototype.run = function () {
  for (var i = this.particles.length - 1; i >= 0; i--) {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};