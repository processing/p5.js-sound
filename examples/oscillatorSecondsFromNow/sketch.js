function setup() {
  osc = new SinOsc();
  osc.freq(220);
}  

function mousePressed () {
  osc.start();
  osc.amp(.5);
}

function mouseReleased() {
  // Will stop instantly on the first call if you hold the mouse longer than 2 seconds.
  // Will stop instantly on later calls instead of waiting 2 seconds. 
  osc.fade(0, 2);
}
