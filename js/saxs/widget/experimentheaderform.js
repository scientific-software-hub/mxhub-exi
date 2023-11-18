/**
 * Shows the header for the experiments changing the color and parameters depending on experiment type
 * 
 */
function ExperimentHeaderForm(args) {
	this.id = BUI.id();
	this.backgroundColor = '#FFFFFF';
	this.onSaved = new Event(this);
}


ExperimentHeaderForm.prototype.load = function(experiment) {
	this.experiment = experiment;
	Ext.getCmp(this.id + "name").setValue(experiment.name);
	if (document.getElementById(this.id + "date")){
		document.getElementById(this.id + "date").innerHTML = "Created on " + (experiment.creationDate);
	}
	//Ext.getCmp(this.id + "comments").setValue(experiment.comments);
};


ExperimentHeaderForm.prototype.getToolBar = function() {
	var _this = this;
	return [
	        {
	            text: 'Save',
	            width : 100,
	            handler : function(){
	            	_this.panel.setLoading();
	            	var onSuccess = (function(sender){
	            		_this.panel.setLoading(false);						
						_this.onSaved.notify(Ext.getCmp(_this.id + "name").getValue());
	            		
	            	});
	            	EXI.getDataAdapter({ onSuccess : onSuccess}).saxs.experiment.saveExperiment(_this.experiment.experimentId, 
					Ext.getCmp(_this.id + "name").getValue(),  _this.experiment.comments)	            			
	            }
			}

	];
};

ExperimentHeaderForm.prototype.getPanel = function() {
	this.panel = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
		buttons : this.getToolBar(),	
		items : [
		        {
								xtype : 'textfield',
								fieldLabel : 'Name' ,
								padding : 20,
								id : this.id + "name"
						}
		] });
	return this.panel;
};

