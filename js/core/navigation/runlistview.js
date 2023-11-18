function RunListView(){
	this.sorters = [];
	ListView.call(this);
}

RunListView.prototype.getPanel = ListView.prototype.getPanel;
RunListView.prototype.load = ListView.prototype.load;

RunListView.prototype.getFilter = function(value){
	return [{property : "name", value : value, anyMatch : true}];
};


RunListView.prototype.formatStatus = function(status){
	if (status == "FINISHED"){
		return "<span style='color:green;font-weight:bold;'>" + status + "</span>" ;
	}
	return "<span style='color:orange;font-weight:bold;'>" + status + "</span>"; 
};

RunListView.prototype.formatJobs = function(jobs){
	var html = "<table>";
	for (var i = 0; i < jobs.length; i++) {
		html = html + "<tr><td>" + jobs[i].name +"</td></tr>";
	}
	return html + "</table>"; 
};

RunListView.prototype.getRow = function(record){
	var html = "<table class='listView'>";
	
		html = html + "<tr><td>Name:</td><td>" + record.data.name+ "</td></tr>";
		html = html + "<tr><td>Status:</td><td>" + this.formatStatus(record.data.status) + "</td></tr>";
		html = html + "<tr><td>Jobs:</td><td>" + this.formatJobs(record.data.jobs) + "</td></tr>";
		html = html + "<tr><td>Date:</td><td>" + record.data.creationDate+ "</td></tr>";
	return html + "</table>";
};

RunListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Jobs',  flex: 1, dataIndex: 'sessionId', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

RunListView.prototype.getFields = function(){
	return  ['name', 'status', 'creationDate', 'jobs'];
};


