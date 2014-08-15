require.config({
	baseUrl:'./',
	paths : {
		'lib' : '../lib',
		'chai' : './testDeps/chai',
	}
});

var allTests = ['tests/p5.SoundFile'];

require(allTests, function(){
	mocha.run(); 
});