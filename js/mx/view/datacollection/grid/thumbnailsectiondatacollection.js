function ThumbnailSectionDatacollection(args) {
}

ThumbnailSectionDatacollection.prototype.getHTML = function(data) {    
    var html = "";
    
    dust.render("thumbnailsection", 
    [{
        urlThumbnail : EXI.getDataAdapter().mx.dataCollection.getThumbNailById(data.lastImageId),
        url         :  EXI.getDataAdapter().mx.dataCollection.getImageById(data.lastImageId),
        ref         : '#/mx/beamlineparameter/datacollection/' + data.DataCollection_dataCollectionId + '/main',
        runNumber : data.DataCollection_dataCollectionNumber,
        prefix : data.DataCollection_imagePrefix,
        comments : data.DataCollectionGroup_comments,        
        sample : data.BLSample_name,
        folder : data.DataCollection_imageDirectory
        
    }], function(err, out) {        
        html = out;
    });
    return html;  
};

