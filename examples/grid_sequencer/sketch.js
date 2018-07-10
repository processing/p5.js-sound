var sloop;

var pitches = [60,61,62,63,64,65,66,67,68,69,70,71];
var cells = [];
var cellWidth, cellHeight;
var numTimeSteps = 16;
var numPitches = 12;

var timeStepCounter = 0;

function setup() {
  createCanvas(720, 400);
  frameRate(10);
  // Prepare cells
  cellWidth = width / numTimeSteps;
  cellHeight = height / numPitches;
  for (var i=0; i<numTimeSteps; i++) {
    for (var j=0; j<numPitches; j++) {
      var x = i*cellWidth;
      var y = j*cellHeight;
      var pitch = pitches[numPitches - j]; // Pitches go from bottom to top
      cells.push(
        new Cell(createVector(x, y), pitch)
      );
    }
  }
  // Create a synth to make sound with
  synth = new p5.PolySynth();
  // Create SoundLoop with 8th-note-long loop interval
  sloop = new p5.SoundLoop(soundLoop, "8n");
  sloop.bpm = 80; // 80 beats per minute
  sloop.start();
}

function soundLoop(cycleStartTime) {
  for (var i=0; i<cells.length; i++) {
    if (floor(i / numPitches) == timeStepCounter) {
      cells[i].active = true;
      if (cells[i].enabled) {
        // Play sound
        var velocity = 1; // Between 0-1
        var quaverSeconds = this._convertNotation('8n'); // 8th note = quaver duration
        var freq = midiToFreq(cells[i].pitch);
        synth.play(freq, velocity, cycleStartTime, quaverSeconds);
      }
    } else {
      cells[i].active = false;
    }
  }
  timeStepCounter = (timeStepCounter + 1) % numTimeSteps;
}

function draw() {
  background(255);
  for (var i=0; i<cells.length; i++) {
    cells[i].checkIfHovered();
    cells[i].display();
  }
}

function mouseClicked() {
  for (var i=0; i<cells.length; i++) {
    if (cells[i].hovered) {
      cells[i].enabled = !cells[i].enabled;
    }
  }
}

var Cell = function(position, pitch) {
  // Sound
  this.pitch = pitch;
  // Appearance
  this.padding = 2;
  this.position = position.copy();
  this.width = cellWidth - 2*this.padding;
  this.height = cellHeight - 2*this.padding;
  this.color = [230, 230, 255];
  // Mouse hover
  this.hovered = false;
  this.hoverColor = [200, 200, 240];
  // Enabled when clicked
  this.enabled = false;
  this.enabledColor = [255, random(255), random(150)];
  // Active when soundloop plays the cell
  this.active = false;
  this.activeColor = [240, 240, 255]; //[230, 230, random(100,255)];
}

Cell.prototype.display = function() {
  noStroke();
  if (this.hovered) {
    fill(this.hoverColor[0], this.hoverColor[1], this.hoverColor[2]);
  } else if (this.enabled) {
    fill(this.enabledColor[0], this.enabledColor[1], this.enabledColor[2]);
  } else if (this.active) {
    fill(this.activeColor[0], this.activeColor[1], this.activeColor[2]);
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