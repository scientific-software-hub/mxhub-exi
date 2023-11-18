/*
function BeamlineParameterMainView() {
    this.icon = 'images/icon/ic_satellite_black_18dp.png';
    MainView.call(this);
    var _this = this;

    this.imageViewer = new ImageResolutionViewer();

    this.detectorResolution = {
        pixelSize: {
            x: 1475,
            y: 1679
        },
        sensitiveArea: {
            x: 253.7,
            y: 288.8
        },
        pixelSizeHorizontal: 0.172

    };

    this.resolutionScatteringImageViewer = new ResolutionScatteringImageViewer({
       width    : 400,
       height   :400 

    });
    
    
    this.resolutionScatteringImageViewer.onResolutionCalculated.attach(function(sender, resolution) {
        if (document.getElementById(_this.id + 'resolution')){
            document.getElementById(_this.id + 'resolution').innerHTML =  Math.round(resolution * 100) / 100 + " &#8491;";
        }
        else{
            document.title = resolution
        }
    });
    
}

BeamlineParameterMainView.prototype.getPanel = MainView.prototype.getPanel;

BeamlineParameterMainView.prototype.getContainer = function() {
    return Ext.create('Ext.panel.Panel', 
                    {
                    xtype : 'container',
                    layout : 'hbox',
                    items : [
                                {
                                    xtype : 'container',
                                    layout : 'vbox',
                                    height : 800,
                                    items : [
                                                {
                                                    html: this.resolutionScatteringImageViewer.getPanel(),
                                                    margin: '10 0 0 5',                                            
                                                    autoScroll : true
                                                },
                                                {
                                                    html:  "<table style='width:400px;'><tr><td style='width:30px;'>Resolution</td><td style='font-size:15px;' class='datacollection_parameter_name' id='" + this.id + "resolution' >Select point on Image</td></tr></table",
                                                    margin: '10 0 0 5',                                            
                                                    flex : 1,
                                                    height : 50,
                                                    autoScroll : true
                                                }
                                            ] 
                                },       
                                {
                                    html: "<div  id='" + this.id + "detector' ></div>",
                                    height : '100%',
                                    margin : '10 0 0 20',
                                    autoScroll : true,
                                    flex : 0.4
                                }
                            ]                            
                    }                                                                                   
    );        
                
   
};




BeamlineParameterMainView.prototype.load = function(dataCollectionId) {

    var _this = this;
    
    //debugger
    //var url = EXI.getDataAdapter().mx.dataCollection.getImageById(imageId);

    
    var onSuccess = function(sender, dataCollections) {
        if (dataCollections){
            if (dataCollections.length > 0){
                var dataCollection = dataCollections[0];
                
                _this.panel.setTitle(dataCollection.DataCollection_imagePrefix);
  
                var wavelength = dataCollection.DataCollection_wavelength;
                var detectorDistance = dataCollection.DataCollection_detectorDistance;
                var xBeam = dataCollection.DataCollection_xBeam;
                var yBeam = dataCollection.DataCollection_yBeam;

                
                 if (ExtISPyB.detectors[dataCollection.detectorModel] != null) {
                    _this.detectorResolution = ExtISPyB.detectors[dataCollection.detectorModel];
                }
                else {
                    alert("Not detector loaded");
                }
                               
                dust.render('beamlineparameter', dataCollection, function(err, out) {
                            document.getElementById(_this.id + "detector").innerHTML = out;
                });
                
  
                _this.resolutionScatteringImageViewer.load(dataCollection.lastImageId,  wavelength, xBeam, yBeam, detectorDistance,  _this.detectorResolution.sensitiveArea);                
            }
        }
       
    };
    EXI.getDataAdapter({ onSuccess: onSuccess }).mx.dataCollection.getByDataCollectionId(dataCollectionId);


};


*/