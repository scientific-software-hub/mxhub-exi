/*function ResolutionScatteringImageViewer(args){

    this.id = BUI.id();
   
   var _this = this;
   this.scatteringImageViewer = new ScatteringImageViewer(args);
   this.scatteringImageViewer.onMouseOver.attach(function(sender, position){
     
      try{ 
            var r = _this.getR(_this.xbeam, _this.ybeam, position.x,  position.y);
            var resolution = _this.wavelength/(2*Math.sin(1/2*Math.atan(r/_this.detectorDistance)));
            _this.onResolutionCalculated.notify(resolution);
      }
      catch(e){
  
          console.log(e);
      }
   });
   
   this.onResolutionCalculated = new Event(this);
    
};

ResolutionScatteringImageViewer.prototype.getPanel = function(){
   return this.scatteringImageViewer.getPanel();
};

ResolutionScatteringImageViewer.prototype.getR = function(xbeam, ybeam, x, y){
  
   x = (x*this.sensitiveArea.x)/this.scatteringImageViewer.width;
   y = (y*this.sensitiveArea.y)/this.scatteringImageViewer.height; 
    
   var squareX = Math.pow((x-xbeam),2);
   var squareY = Math.pow((y-ybeam),2);
   return Math.sqrt(squareX + squareY);
   
};

ResolutionScatteringImageViewer.prototype.load = function(imageId, wavelength, xbeam, ybeam, detectorDistance, sensitiveArea){
    var url = EXI.getDataAdapter().mx.dataCollection.getImageById(imageId);    
   this.scatteringImageViewer.load(url);
   
   this.wavelength = wavelength;
   this.xbeam = xbeam;
   this.ybeam = ybeam;
   this.detectorDistance = detectorDistance;
   this.sensitiveArea = sensitiveArea;

};*/