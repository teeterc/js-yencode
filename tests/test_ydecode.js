var uuencode = require ('../lib/yencode');
var fs = require ('fs');

var inFile = './data/test.ync';

function test(){
    data = "";
    var infs = fs.createReadStream(inFile)
	.on('open', function (){
	    infs
		.pipe(new uuencode({decoder: true}))
		.on('data', function (d){
		    data += d;
		})
		.on('end', function (){
		    console.log(data == "INPUT\n");
		});
	})
    };

test();
