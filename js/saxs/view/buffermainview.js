function BufferMainView() {
	
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	this.queueGridList = [];

	MainView.call(this);

	this.bufferForm = new BufferForm({
		height : 800,
		collapsed : false,
		tbar : true
	});
	
	var _this = this;
//	this.bufferGrid.onUpdated.attach(function(sender){
//		_this.load();
//	});
	
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

BufferMainView.prototype.getPanel = MainView.prototype.getPanel;

BufferMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'hbox'
	    },
	    margin : 15,
//		bodyStyle : {
//			"background-color" : "#E6E6E6" 
//		},
	    border: 1,
//	    style: {borderColor:'#000000', borderStyle:'solid', borderWidth:'1px'},
	    defaults: {
	        labelWidth: 80,
//	        xtype: 'datefield',
	        flex: 1,
	    },
	    items: [this.bufferForm.getPanel([])]
	});
};


BufferMainView.prototype.load = function(bufferId) {
//	this.bufferGrid.load(EXI.proposalManager.getBuffers());
	this.panel.setTitle("Buffer");
	this.bufferForm.load(EXI.proposalManager.getBufferById(bufferId));
};
