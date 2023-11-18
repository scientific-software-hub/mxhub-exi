function SessionSaxsListView(){
	this.sorters = [{property : 'experimentId', direction: 'DESC'}];
	ListView.call(this);
}

SessionSaxsListView.prototype.getPanel = ListView.prototype.getPanel;
SessionSaxsListView.prototype.load = ListView.prototype.load;

SessionSaxsListView.prototype.parseStatistics = function(done, total){
    if (total){
        if (done){
            try{
                return (done/total)*100;
            }   
            catch(err){
                return 0;
            }
            
        }        
    }
    return 0;
};
SessionSaxsListView.prototype.getRow = function(record){
    var html = '';
   
    record.data.measured = this.parseStatistics(record.data.measurementDoneCount, record.data.measurementCount);
    record.data.averaged = this.parseStatistics(record.data.measurementAveragedCount, record.data.measurementCount);
    record.data.subtracted = this.parseStatistics(record.data.dataCollectionDoneCount, record.data.dataCollectionCount);
    
    record.data.downloadURL = EXI.getDataAdapter().saxs.experiment.getDownloadExperimentURL(record.data.experimentId);
    dust.render("sessionsaxslistview.template", record.data, function(err, out){
        	html = out;
     	});
	return html;
};

SessionSaxsListView.prototype.getFilter = function(value){
	return [{property : "name", value : value, anyMacth : true}];
};

SessionSaxsListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Experiment',  flex: 1, dataIndex: 'sessionId', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

SessionSaxsListView.prototype.getFields = function(){
	return  ['creationDate', 'name', 'experimentType'];
};

