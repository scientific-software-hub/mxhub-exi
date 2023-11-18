/**
* PuckListView displays the pucks as list on the navigation panels
*
* @class PuckListView
* @constructor
*/
function PuckListView(){
	this.title = "Pucks";
	this.sorters = [{property : 'sessionId', direction: 'DESC'}];
	ListView.call(this);
}

PuckListView.prototype.getPanel = ListView.prototype.getPanel;
PuckListView.prototype.load = ListView.prototype.load;
PuckListView.prototype.getFilter = ListView.prototype.getFilter;
PuckListView.prototype.getFields = ListView.prototype.getFields;
PuckListView.prototype.getColumns = ListView.prototype.getColumns;

/**
* Calls to the dust template in order to render to puck in HTML
*
* @class getRow
* @constructor
*/
PuckListView.prototype.getRow = function(record){
	var html = "";
	dust.render("puck.listview", record.data, function(err, out){
        	html = out;
     	});
	return html;
};





