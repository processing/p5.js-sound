var audioGrab;
var numSources = 0;
var fft = [];
var audioGrabArray = [];

function setup() {
    createCanvas(512, 400);
    textSize(32);
    textAlign(LEFT, CENTER);
    //we will use a new p5AudioIn to enumerate the
    //audio devices. This won't connect to any output.
    audioGrab = new p5.AudioIn();
    audioGrab.getSources(function(sourceList) {

        numSources = sourceList.length;
        //creating an array of all the available sources
        for (var i = 0; i < numSources; i++) {
            audioGrabArray[i] = new p5.AudioIn();
            audioGrabArray[i].setSource(i);
            audioGrabArray[i].start();

            //from the FFT example
            fft[i] = new p5.FFT();
            fft[i].setInput(audioGrabArray[i]);
        }
    });
}

function draw() {
    background(200);
    for (var i = 0; i < numSources; i++) {
        var yPos = ((i + 1) / numSources) * height;
        var spectrum = fft[i].analyze();

        stroke();
        line(0, ((i + 1) / numSources) * height, width, yPos);
        beginShape();
        vertex(0, ((i + 1) / numSources) * height);

        noStroke();
        fill(0, 255, 255);
        for (j = 0; j < spectrum.length; j++) {
            vertex(j, map(spectrum[j], 0, 1023, yPos, 0));
        }
        endShape();

        //without using HTTPS, Chrome cannot give us device names (such as
        //'mic' or 'soundflower'). We can use this visualization to determine
        //which input array position number is the one we want.
        //The first two are typically "default" and "mic" 
        //(default usually is the mic)

        fill(0);
        text("input array position: " + i, 10, yPos - 0.5 * height / numSources);
    }
}
