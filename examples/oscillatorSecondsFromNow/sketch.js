function setup() {
  osc = new TriOsc();
  osc.freq(260);
  createP('mousePressed: set amplitude to .7 over the course of .2 seconds');
  createP('mouseReleased: set amplitude to 0 over the course of 1 second. Start the fade after .5 seconds.');
}

function mousePressed () {
  osc.start();
  // fade amplitude to .7 over the course of .2 seconds
  osc.amp(0.7, 0.02);
}

function mouseReleased() {
  // fade amplitude to zero over the course of 1 second. Start the fade after .5 seconds.
  osc.amp(0, 1, 0.5);
}
