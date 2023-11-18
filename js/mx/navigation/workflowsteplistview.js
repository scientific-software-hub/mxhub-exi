function WorkflowStepListView(workflowId){
	this.workflowId=workflowId;
	ListView.call(this);
}

WorkflowStepListView.prototype.getPanel = ListView.prototype.getPanel;
WorkflowStepListView.prototype.load = ListView.prototype.load;


WorkflowStepListView.prototype.getRow = function(record){
    var html = "";
    record.data.imageURL = EXI.getDataAdapter().mx.workflowstep.getImageByWorkflowStepId(record.data.workflowStepId);
    dust.render("workflowstepmain_steps", record.data, function(err, out){
		html = out;
     });
     return html;

};

WorkflowStepListView.prototype.getFilter = function(value){
	return [{property : "acronym", value : value, anyMacth : true}];
};

WorkflowStepListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Workflows <a href="' + EXI.getDataAdapter().mx.workflow.getWorkflowLogUrl(this.workflowId) + '">(view log)</a>',  flex: 1, dataIndex: 'bufferId', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

WorkflowStepListView.prototype.getFields = function(){
	return  ['acronym', 'name'];
};

