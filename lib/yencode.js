var mUtil = require('util');
var mStream = require('stream');

var yenc42 = {};
for (var i = 0; i < 256; i ++){
    yenc42[i] = (i - 42) & 255;
}

var yenc64 = {};
for (var i = 0; i < 256; i ++){
    yenc64[i] = (i - 64) & 255;
}

var YEncode = function () {
    this.options = {'decoder': true};
    this.readable = true;
    this.writable = true;

    this.decodeHead = ""; // used for complete lines
    this.decodeTail = "";

    this.header;
}

mUtil.inherits(YEncode, mStream);

methods = {
    'parseHeader': function (data){
	if(data && data.indexOf('=ybegin') == 0)
	    this.header = true;
    },
    '_decodeLine': function (line){
	if (line.indexOf("=yend") == 0){
	    return false;
	}
	var data = line.split("=")
	var copy = line.split("=")
	var buffer = [];
	for(var i = 0; i < data[0].length; i ++){
	    buffer.push(yenc42[data[0].charCodeAt(i)]);
	};

	for(var i = 1; i < copy.length; i ++){
	    var data = [];
	    for(var j = 0; j < data[0].length; j ++){
		data.push(yenc42[data[0].charCodeAt(j)]);
	    };
	    buffer.push(yenc64[data[0]])
	    for(var j = 1; j < data.length; j ++){
		data.push(yenc42[data[j].charCodeAt(j)]);
	    };
	};
	var buf = new Buffer(buffer);
	this.emit('data', new Buffer(buffer));
    },
    'decode': function (data){
	data = data.toString();
	if ( data.indexOf("\r"))  {
	    dataLines = data.split("\r\n");
	} else {
	    dataLines = data.split("\n");
	};

	dataLines[0] = this.decodeTail + dataLines[0];
	this.decodeTail = dataLines.pop();
	for (var l = 0; l < dataLines.length; l ++){
	    if (!this.header) {
		this.parseHeader(dataLines[l])
	    } else if (!this._decodeLine(dataLines[l])) {
		break;
	    }
	};

	this.parseHeader();
    },
    'end': function (){
	this.decode("");
	this.emit('end');
    },
    
    'write': function (data){
	if (this.options.decoder){
	    this.decode(data);
	} else {
	    throw new Exception ('YEnc, encoding is not supported');
	};
    }
}

Object.keys(methods).forEach(function (key){
    YEncode.prototype[key] = methods[key];
});

module.exports = YEncode