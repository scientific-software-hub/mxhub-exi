function DesignerMainView() {
	
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	this.queueGridList = [];

	MainView.call(this);

	var _this = this;
	
	
	this.wizardWidget = new WizardWidget({
		windowMode : true,
		width : 1200 });
//
	this.wizardWidget.onFinished.attach(function(sender, result) {
//		wizardWidget.window.close();
		EXI.setLoading();
		var onSuccess = function(sender, experiment) {
			location.hash = "/experiment/templateId/" + experiment.experimentId + "/main";
		};
//		wizardWidget.current.setLoading("ISPyB: Creating experiment");
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.template.saveTemplate(result.name, result.comments, result.data);
	});
//
//	wizardWidget.draw(new MeasurementCreatorStepWizardForm(EXI.proposalManager.getMacromolecules(),EXI.proposalManager.getBuffers()));
		
		
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

DesignerMainView.prototype.getPanel = MainView.prototype.getPanel;

DesignerMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'hbox'
	    },
	    margin : 15,
	    border: 1,
	    defaults: {
	        labelWidth: 80,
	        flex: 1,
	    },
	    items: [this.wizardWidget.getPanel(new MeasurementCreatorStepWizardForm(EXI.proposalManager.getMacromolecules(),EXI.proposalManager.getBuffers()))]
	});
};


DesignerMainView.prototype.load = function(bufferId) {
//	this.bufferGrid.load(EXI.proposalManager.getBuffers());
	this.panel.setTitle("Experiment Designer");
	
};
