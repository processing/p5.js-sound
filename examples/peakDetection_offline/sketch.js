// Beat Detection with offline context
// port of this code : http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
// and this one too : https://github.com/JMPerez/beats-audio-api


var file ='../_files/Tripping.mp3'

var source_file; // sound file
var src_length; // hold its duration

var pg_beats; // to draw the beat detection on preprocessed song
var pg_tempo; // draw our guessed tempi

function preload(){
    source_file = loadSound(file); // preload the sound
   // clave = loadSound('cl.wav');
}


function setup() {
  createCanvas(windowWidth, 150);
  textAlign(CENTER);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  println("source duration: " +src_length);

  // prepare our tempo display
  pg_tempo = createGraphics(width,100);
  pg_tempo.background(180);
  pg_tempo.strokeWeight(3);
  pg_tempo.noFill();
  pg_tempo.stroke(255);
  pg_tempo.rect(0,0,width,100);
  pg_tempo.strokeWeight(1);
  //prepare our beats graph display
  pg_beats = createGraphics(width,50);
  pg_beats.background(180);
  pg_beats.strokeWeight(3);
  pg_beats.noFill();
  pg_beats.stroke(255);
  pg_beats.rect(0,0,width,50);
  pg_beats.strokeWeight(1);

  // find beat preprocessing the source file with lowpass
  var beats = processPeaks(source_file, onComplete); // it will draw in pg_beats and pg_tempo

}

function draw() {
	background(225);

	// image(pg_tempo,0,0); // display detected tempi
	// image(pg_beats,0,100); // display filtered beats we found preprocesing with a lp filter
}

// function drawPeaksAtTreshold(data, threshold) {

//   for(var i = 0; i <  data.length;) {	
//     if (data[i] > threshold) {
//       var xpos = map(i,0,data.length,0,width);
//       var intensity = map(data[i],threshold,0.3,0,255);
//       var hei = map(data[i],threshold,0.3,3,50);
//       pg_beats.stroke(intensity,0,0);
//       pg_beats.line(xpos,3,xpos,47);

//       // Skip forward ~ 1/8s to get past this peak.
//       i += 6000; 
//     }
//     i++;
//   }
// }

var Peak = function(amp, i) {
  this.sampleIndex = i;
  this.amplitude = amp;
  this.tempos = [];
  this.intervals = [];
}

var allPeaks = [];

function processPeaks(soundFile, callback) {
  var bufLen = soundFile.buffer.length;
  var sampleRate = soundFile.buffer.sampleRate;
  var buffer = soundFile.buffer;

  var initialThreshold = 0.9,
      threshold = initialThreshold,
      minThreshold = 0.22,
      minPeaks = 200;

  // Create offline context
  var offlineContext = new OfflineAudioContext(1, bufLen, sampleRate);

  // create buffer source
  var source = offlineContext.createBufferSource();
  source.buffer = buffer;

  // Create filter. TO DO: allow custom setting of filter
  var filter = offlineContext.createBiquadFilter();
  filter.type = "lowpass";
  source.connect(filter);
  filter.connect(offlineContext.destination);

  // start playing at time:0
  source.start(0);  
  offlineContext.startRendering(); // Render the song

  // act on the result
  offlineContext.oncomplete = function(e) {
    var data = {};

    var filteredBuffer = e.renderedBuffer;
    var bufferData = filteredBuffer.getChannelData(0);


    // step 1: 
    // create Peak instances, add them to array, with strength and sampleIndex
    do {
      allPeaks = getPeaksAtThreshold(bufferData, threshold);
      threshold -= 0.005;
    } while (Object.keys(allPeaks).length < minPeaks && threshold >= minThreshold);


    // step 2:
    // find intervals for each peak in the sampleIndex, add tempos array
    var intervalCounts = countIntervalsBetweenNearbyPeaks(allPeaks);

    // step 3: find top tempos
    var groups = groupNeighborsByTempo(intervalCounts, filteredBuffer.sampleRate);

    // sort top intervals
    var topTempos = groups.sort(function(intA, intB) {
       return intB.count - intA.count;

    }).splice(0,5);

    var topTempo = topTempos[0].tempo;

    // step 3:
    // new array of peaks at top tempo
    var tempoPeaks = getPeaksAtTopTempo(allPeaks, topTempo);


    callback(allPeaks);
  }

}






// 1. Function to identify peaks above a threshold
// returns an array of peak indexes as frames (samples) of the original soundfile
function getPeaksAtThreshold(data, threshold) {
  var peaksObj = {};
  var length = data.length;

  for(var i = 0; i < length; i++) {
    if (data[i] > threshold) {
      var amp = data[i];
      var peak = new Peak(amp, i);
      peaksObj[i] = peak;
      // Skip forward ~ 1/8s to get past this peak.
      i += 6000; 
    }
    i++;
  }

  return peaksObj;
}

// 2. 
function countIntervalsBetweenNearbyPeaks(peaksObj) {
  var intervalCounts = [];
  var peaksArray = Object.keys(peaksObj).sort();

  for (var index = 0; index < peaksArray.length; index++) {

    // find intervals in comparison to nearby peaks
    for (var i = 0; i < 10; i++) {
      var startPeak = peaksObj[peaksArray[index]];
      var endPeak = peaksObj[peaksArray[index + i]];

      if (startPeak && endPeak) {
        startPos = startPeak.sampleIndex;
        endPos = endPeak.sampleIndex;
        var interval =  endPos - startPos;

        // add a sample interval to the startPeek in the allPeaks array
        startPeak.intervals.push(interval);

        // tally the intervals and return interval counts
        var foundInterval = intervalCounts.some(function(intervalCount, p) {
          if (intervalCount.interval === interval){
            intervalCount.count++;
            return intervalCount;
          }
        });

        // store with JSON like formatting
        if (!foundInterval) {
          intervalCounts.push({
            interval: interval,
            count: 1,
          });
        }
      }
    }
  }

  return intervalCounts;
}


// 3. find tempo
function groupNeighborsByTempo(intervalCounts, sampleRate) {
  var tempoCounts = []

  intervalCounts.forEach(function(intervalCount, i) {

    try {
      // Convert an interval to tempo
      var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );

      if (!isFinite(theoreticalTempo)) {
        return;
      };

      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo <= 90) theoreticalTempo *= 2;
      while (theoreticalTempo >= 180) theoreticalTempo /= 2;

      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return tempoCount.count += intervalCount.count;
      });
      if (!foundTempo) {
        tempoCounts.push({
          tempo: Math.round(theoreticalTempo),
          count: intervalCount.count
        });
      }
    } catch(e) {
      throw e;
    }

  });

  return tempoCounts;
}

// 4. peaks at top tempo
function getPeaksAtTopTempo(peaksObj, tempo) {
  var peaksArray = Object.keys(peaksObj).sort();

  // TO DO: filter out peaks that have the tempo and return

}

function onComplete(data) {
  console.log(data);
}
