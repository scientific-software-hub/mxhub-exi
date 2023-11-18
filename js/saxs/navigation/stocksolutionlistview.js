function StockSolutionListView(){
	this.sorters = [{property : 'experimentId', direction: 'DESC'}];
	ListView.call(this);
}

StockSolutionListView.prototype.getPanel = ListView.prototype.getPanel;
StockSolutionListView.prototype.load = ListView.prototype.load;
StockSolutionListView.prototype.getFilter = ListView.prototype.getFilter;
StockSolutionListView.prototype.getFields = ListView.prototype.getFields;
StockSolutionListView.prototype.getColumns = ListView.prototype.getColumns;


/**
* Calls to the dust template in order to render to puck in HTML
*
* @class getRow
* @constructor
*/
StockSolutionListView.prototype.getRow = function(record){
	var html = "";
	if (EXI.proposalManager.getBufferById(record.data.bufferId)){
		record.data.bufferAcronym = EXI.proposalManager.getBufferById(record.data.bufferId).acronym;
	}
	if (EXI.proposalManager.getMacromoleculeById(record.data.macromoleculeId)){
		record.data.macromoleculeAcronym = EXI.proposalManager.getMacromoleculeById(record.data.macromoleculeId).acronym;
	}
	dust.render("stocksolution.listview", record.data, function(err, out){
        	html = out;
     	});
	return html;
};
