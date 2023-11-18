/*function ScatteringImageViewer(args){
    this.width = 100;
    this.height = 100;
    this.id = BUI.id();
    
    if (args){
        if (args.height){
            this.height = args.height;
        }
          if (args.width){
            this.width = args.width;
        }
    }
    
    this.onMouseOver = new Event(this);
    
};

ScatteringImageViewer.prototype.getPanel = function(){
    return '<img id="' + this.id + '" style="background-color: green;width:' + this.width +'px; height:' + this.height +'px;" />'
};


ScatteringImageViewer.prototype.findPosition = function(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
	do {
	    curleft += obj.offsetLeft;
	    curtop += obj.offsetTop;
	} while (obj = obj.offsetParent);
	return { x: curleft, y: curtop };
    }
    return undefined;
};

ScatteringImageViewer.prototype.getCoordinates = function(obj, e) {
     	var pos = this.findPosition(obj);
    	var x = e.pageX - pos.x;
    	var y = e.pageY - pos.y;
        return {
                            x 	: x,
                            y 	: y
        };
};
ScatteringImageViewer.prototype.load = function(url){    
    var _this = this;  
    
    $('#' + _this.id).load(function() {        
        $('#' + _this.id).mousemove(function(e) {
           _this.onMouseOver.notify(_this.getCoordinates(this, e));
        });
    }).attr('src', url);
};*/