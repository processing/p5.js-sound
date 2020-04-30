'use strict '

define(['chai'],(chai)=>{
    const expect = chai.expect ;
    describe('P5.Gain',()=>{
        it('can be initilized and disposed',()=>{
            let gain = new p5.Gain();
            gain.dispose();
        });
        it('can set input', ()=>{
            let inputNode = new p5.Gain();
            let mainGainNode  = new p5.Gain();

            mainGainNode.setInput(inputNode);
        });
        it('can send output',()=>{
            let outputNode = new p5.Gain();
            let mainGainNode  = new p5.Gain();
            
            mainGainNode.connect(outputNode);
        });
        it('can disconnect  all output' ,()=>{
            let inputNode = new p5.Gain();
            let outputNode = new p5.Gain();
            let mainGainNode  = new p5.Gain();

            mainGainNode.setInput(inputNode);
            mainGainNode.connect(outputNode);
            mainGainNode.disconnect();
        });
        it('can set the output level of gain Node', ()=>{
            let osc = new p5.Oscillator('sine');
            let mainGainNode  = new p5.Gain();
            let amplitude = new p5.Amplitude();

            osc.amp(1);
            osc.start();
            osc.disconnect();

            mainGainNode.setInput(osc);
            amplitude.setInput(mainGainNode);
            
            mainGainNode.amp(0.5);
            setTimeout(function() {
                expect( amplitude.getLevel() ).to.be.closeTo(0.25, 0.125);
              }, 100);

        })
    });

}) ;