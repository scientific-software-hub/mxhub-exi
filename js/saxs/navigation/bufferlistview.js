function BufferListView(){
	ListView.call(this);
}

BufferListView.prototype.getPanel = ListView.prototype.getPanel;
BufferListView.prototype.load = ListView.prototype.load;


BufferListView.prototype.getRow = function(record){
	var html = "<table class='listView'>";
		html = html + "<tr><td>Acronym:</td><td style='color:#207a7a;font-weight:bold;'>" + record.data.acronym+ "</td></tr>";
		html = html + "<tr><td>name:</td><td>" + record.data.name+ "</td></tr>";
	return html + "</table>";
};

BufferListView.prototype.getFilter = function(value){
	return [{property : "acronym", value : value, anyMacth : true}];
};

BufferListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Buffers',  flex: 1, dataIndex: 'bufferId', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

BufferListView.prototype.getFields = function(){
	return  ['acronym', 'name'];
};

