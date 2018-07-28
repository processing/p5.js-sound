/**
 *  Example: Genetic music
 */

var synth;
var sloop;

var validNotes = [...Array(128).keys()];
var minValidNote, maxValidNote;

var maxPopulationSize = 40;
var numberOfSurvivors = 5;
var population = [];
var songLength = 32; // 4 bars * 8th-note resolution

var songIsPlaying = false;
var clickedEarwormIndex;
var notePlaybackIndex;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  colorMode(HSB, 255);
  textAlign(CENTER, CENTER);

  sloop = new p5.SoundLoop(soundLoop, 0.3); // Loop plays every 0.3s
  synth = new p5.PolySynth();

  minValidNote = min(validNotes);
  maxValidNote = max(validNotes);
  for (var i=0; i<maxPopulationSize; i++) {
    var song = new Earworm(i);
    song.initialize();
    population.push(song);
  }

  selectionButton = createButton("Selection");
  selectionButton.mouseClicked(selectFittest);
  selectionButton.position(10, 10);
  reproductionButton = createButton("Reproduction");
  reproductionButton.mouseClicked(reproducePopulation);
  reproductionButton.position(10, 40);
}

function selectFittest() {
  // Sort in descending order of fitness
  population.sort((a, b) => b.fitnessScore - a.fitnessScore);
  // Keep only the N fittest
  population = subset(population, 0, numberOfSurvivors);
  // Re-assign ID numbers
  for (var i=0; i<population.length; i++) {
    population[i].id = i;
  }
}

function reproducePopulation() {
  var newPopulation = [];
  while (newPopulation.length < maxPopulationSize - numberOfSurvivors) {
    var parentA = random(population);
    var parentB = random(population);
    var child = parentA.reproduceWith(parentB);
    newPopulation.push(child);
  }
  // Add new generation to the survivors
  population = population.concat(newPopulation);
  // Re-assign ID numbers
  for (var i=0; i<population.length; i++) {
    population[i].id = i;
  }
}

function soundLoop(cycleStartTime) {
  var duration = this.interval;
  var velocity = 0.7;
  var midiNote = population[clickedEarwormIndex].notes[notePlaybackIndex];
  var noteFreq = midiToFreq(midiNote);
  synth.play(noteFreq, velocity, 0, duration);
  // Move forward the index, and stop if we've reached the end
  notePlaybackIndex++;
  if (notePlaybackIndex >= population[clickedEarwormIndex].notes.length) {
    this.stop();
    songIsPlaying = false;
  }
}

function draw() {
  background(30);
  for (var i=0; i<population.length; i++) {
    population[i].display();
  }
  if (songIsPlaying) {
    fill(255);
    text("Song playing... Click to stop.", width/2, height/2);
  }
}

function mousePressed() {
  if (songIsPlaying) {
    // Stop a song
    sloop.stop();
    songIsPlaying = false;
  } else {
    // Start a song
    for (var i=0; i<population.length; i++) {
      var clickToEarwormDistance = dist(mouseX, mouseY, population[i].xpos, population[i].ypos);
      if (clickToEarwormDistance < population[i].radius) {
        clickedEarwormIndex = i;
        notePlaybackIndex = 0;
        songIsPlaying = true;
        sloop.start();
      }
    }  
  }
}

function Earworm(indexNumber) {
  this.id = indexNumber;
  this.length = songLength;
  this.notes = [];
  // Visual properties
  this.xpos = random(width);
  this.ypos = random(height);
  this.radius = 30;
  this.fitnessScore = 0;
}
Earworm.prototype.initialize = function() {
  this.notes = [];
  for (var i=0; i<this.length; i++) {
    this.notes.push(random(validNotes));
  }
  this.calculateFitness();
};
Earworm.prototype.display = function() {
  push();
  strokeWeight(1);
  angleMode(DEGREES); // Change the mode to DEGREES
  var angle = 360 / this.notes.length;
  translate(this.xpos, this.ypos);
  for (var i=0; i<this.notes.length; i++) {
    var color = map(this.notes[i], minValidNote, maxValidNote, 250, 100);
    var length = map(this.notes[i], minValidNote, maxValidNote, this.radius/2, this.radius);
    strokeWeight(1);
    stroke(color, 180, 250);
    if (songIsPlaying) {
      if (this.id == clickedEarwormIndex) {
        stroke(color, 180, 250);
        if (i == notePlaybackIndex) {
          strokeWeight(2);
          length = this.radius;
        } else {
          strokeWeight(1);
        }
      } else {
        stroke(color, 100, 100);
      }
    }
    rotate(angle);
    line(0, 0, length, 0);
  }
  pop();
};
Earworm.prototype.calculateFitness = function() {
  this.fitnessScore = 0;
  // Self-similarity
  // Key
  // setA = subset(this.notes, 0, this.notes.length/2);
  // setB = subset(this.notes, this.notes.length/2, this.notes.length);

  // Pitch range
  var minGoodPitch = 40;
  var maxGoodPitch = 80;
  for (var i=0; i<this.notes.length; i++) {
    if (this.notes[i] > minGoodPitch) {
      this.fitnessScore = this.fitnessScore + 10;
    }
    if (this.notes[i] < maxGoodPitch) {
      this.fitnessScore = this.fitnessScore + 10;
    } 
  }
  // Starting and ending on the same note
  // var startAndEndSame = (this.notes[0] == this.notes[this.notes.length - 1]);

  // Rhythm
};
Earworm.prototype.reproduceWith = function(partner) {
  var partA = subset(this.notes, 0, this.notes.length/2);
  var partB = subset(partner.notes, partner.notes.length/2, partner.notes.length);
  var child = new Earworm(0);
  child.notes = partA.concat(partB);
  child.mutate(); // Add some random variation
  child.calculateFitness();
  return child;
};
Earworm.prototype.mutate = function() {
  for (var i=0; i<this.notes.length; i++) {
    if (random(100) > 90) {
      this.notes[i] = random(validNotes);
    }
  }
};