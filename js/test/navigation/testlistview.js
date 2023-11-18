function TestListView(){
	this.title = "Samples";
	ListView.call(this);
}

TestListView.prototype.getPanel = ListView.prototype.getPanel;
TestListView.prototype.load = ListView.prototype.load;
TestListView.prototype.getFields = ListView.prototype.getFields;
TestListView.prototype.getColumns = ListView.prototype.getColumns;

TestListView.prototype.getRow = function(record){
	var html = "";			
	dust.render("testlistview.template", record.data, function(err, out){		
        	html = out;
     	});
	return html;
};

TestListView.prototype.getFilter = function(value){	
	return [{property : "name", value : value, anyMatch : true}];
};