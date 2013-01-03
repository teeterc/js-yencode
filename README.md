js-yenc
=======

JS - YEnc

Usage:
  Command line
  ./bin/ydecode input output

  Streams

```javascript  
var yencode = require ('yencode');
var fs = require ('fs');

var inFile = './data/test.ync';

function test(){
    data = "";
    var infs = fs.createReadStream(inFile)
	.on('open', function (){
	    infs
		.pipe(newyencode({decoder: true}))
		.on('data', function (d){
		    data += d;
		})
		.on('end', function (){
		    console.log(data);
		});
	})
    };

test();
```
