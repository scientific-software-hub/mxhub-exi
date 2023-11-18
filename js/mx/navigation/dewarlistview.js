/**
* DewarListView displays the dewars as list on the navigation panels
*
* @class DewarListView
* @constructor
*/
function DewarListView(){
	this.title = "Dewars";
	this.sorters = [{property : 'sessionId', direction: 'DESC'}];
	ListView.call(this);
}


DewarListView.prototype.getPanel = ListView.prototype.getPanel;
DewarListView.prototype.load = ListView.prototype.load;
DewarListView.prototype.getFields = ListView.prototype.getFields;
DewarListView.prototype.getColumns = ListView.prototype.getColumns;

/**
* Calls to the dust template in order to render to puck in HTML
*
* @class getRow
* @constructor
*/
DewarListView.prototype.getRow = function(record){
    var html = "";
    dust.render("dewarlistview", record.data, function(err, out){
        html = out;
     });
    return html;
};

