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

var toString = function(bytes, start, end){
    var ret = ""
    for (var i = start; i < end; i ++){
	ret += String.fromCharCode(bytes[i]);
    };
    return ret;
};


mUtil.inherits(YEncode, mStream);

methods = {
    'parseHeader': function (data){
	if(data && data.indexOf('=ybegin') == 0)
	    this.header = true;
    },

    '_decodeSeg': function (seg, segNum) {
	var copy = []
	Array.prototype.push.apply(copy, seg);
	var buffer = [];
	if (segNum == 0){
	    for(var i = 0; i < seg.length; i ++){
		buffer.push(yenc42[seg[i]]);
	    };
	    this.emit('data', new Buffer(buffer));
	    return;
	};

	var data = [];
	for(var i = 0; i < copy.length; i ++){
	    data.push(yenc42[copy[i]]);
	};

	buffer.push(yenc64[data[0]])

	for(var i = 1; i < data.length; i ++){
	    buffer.push(data[i]);
	};
	this.emit('data', new Buffer(buffer));
	

    },
    '_decodeLine': function (line){
	var lead = toString(line, 0, 7);
	if (lead && lead.indexOf("=yend") == 0){
	    return false;
	}
	if (lead && lead.indexOf('=ybegin') == 0){
	    return true;
	}
	var segNum = 0;
	var seg = [];
	for (var i = 0; i < line.length; i ++ ){
	    if ( line[i] == 61 ) {
		this._decodeSeg(seg, segNum);
		segNum ++;
		seg = [];
	    } else {
		seg.push(line[i]);
	    }
	};
	this._decodeSeg(seg, segNum);
    },
    'decode': function (data){
	var line = [];
	for (var i = 0; i < data.length; i ++){
	    if (data[i] == 13){ // /r
		i += 1
		this._decodeLine(line);
		line = [];
	    } else if (data[i] == 10) {
		this._decodeLine(line);
		line = [];
	    } else {
		line.push(data[i]);
	    };
	};
	this._decodeLine(line);
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