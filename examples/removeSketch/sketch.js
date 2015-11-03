function init() {
    var s = function(c) {

        c.backgroundSound;
        c.sounds = {};
        c.soundFiles = [
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/51676/chords1.mp3',
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/51676/chords2.mp3',
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/51676/chords3.mp3',
        ];
        c.count = 0;

        c.preload = function() {
            c.backgroundSound = c.loadSound("https://s3-us-west-2.amazonaws.com/s.cdpn.io/51676/FM8_synth_chords.mp3");

            for (var i = 0; i < c.soundFiles.length; i++) {
                c.sounds[i] = c.loadSound(c.soundFiles[i]);
            }
        }

        c.setup = function() {
            c.cnv = c.createCanvas(c.windowWidth, c.windowHeight);
            c.text('click 5 times to remove the sketch', 20, 20);
            c.backgroundSound.amp(1);
            c.backgroundSound.loop(0, 1, 1, 0, (c.backgroundSound.duration() - 0.1));
        }

        c.draw = function() {

        }

        c.mousePressed = function() {
            if (c.count == 5) {
                c.remove();
            } else {
                c.sounds[c.count % 3].play();
            }

            c.count++;
        }
    };

    new p5(s);
}

init();