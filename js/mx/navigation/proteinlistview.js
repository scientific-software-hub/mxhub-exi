function ProteinListView(){
	ListView.call(this);
}

ProteinListView.prototype.getPanel = ListView.prototype.getPanel;
ProteinListView.prototype.load = ListView.prototype.load;


ProteinListView.prototype.getRow = function(record){
	var html = "<table class='listView'>";
		html = html + "<tr><td>Acronym:</td><td style='color:#207a7a;font-weight:bold;'>" + record.data.acronym+ "</td></tr>";
		html = html + "<tr><td>Name:</td><td>" + record.data.name+ "</td></tr>";
	return html + "</table>";
};

ProteinListView.prototype.getFilter = function(value){
	return [{property : "acronym", value : value, anyMacth : true}];
};

ProteinListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Proteins',  flex: 1, dataIndex: 'bufferId', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

ProteinListView.prototype.getFields = function(){
	return  ['acronym', 'name'];
};

