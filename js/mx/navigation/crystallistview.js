/**
* CrystalListView displays the crystal as list on the navigation panels
*
* @class PuckListView
* @constructor
*/
function CrystalListView(){
	ListView.call(this);
}


CrystalListView.prototype.getPanel = ListView.prototype.getPanel;
CrystalListView.prototype.load = ListView.prototype.load;
CrystalListView.prototype.getFilter = ListView.prototype.getFilter;
CrystalListView.prototype.getFields = ListView.prototype.getFields;
CrystalListView.prototype.getColumns = ListView.prototype.getColumns;


CrystalListView.prototype.getRow = function(record){
	var html = "";
	dust.render("crystal.listview", record.data, function(err, out){
        	html = out;
     	});
	return html;
};


