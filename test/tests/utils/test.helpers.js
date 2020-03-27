'use strict';

define(['chai'],(chai)=>{
    const safeBins = p5.prototype.safeBins;
    let expect = chai.expect;

    describe('safeBins', ()=>{
        it('can handle negative input ',()=>{
            let test =-Math.random()*2;
            expect(safeBins(test)).to.equal(1024);
        });
        it('can handle value less than 16 ',()=>{
            let test = 10;
            expect(safeBins(test)).to.equal(1024);
        });
        it('can handle value greater than 1024',()=>{
            let test = 1500;
            expect(safeBins(test)).to.equal(1024);
        });
        it('can handle value other than power 2',()=>{
            let test = 1500;
            expect(safeBins(test)).to.equal(1024);
        });
        it('can handle value equal to 0',()=>{
            let test = 0;
            expect(safeBins(test)).to.equal(1024);
        });
        it('can handle strings',()=>{
            let test = 'testString';    
            expect(safeBins(test)).to.equal(1024);
        });

    });

});