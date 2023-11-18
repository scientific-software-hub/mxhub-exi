function StockSolutionMainView() {
	
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	this.queueGridList = [];

	MainView.call(this);

	this.stockSolutionForm = new StockSolutionForm({
//		width : this.width - 10,
		minHeight : 800,
		height : 800,
		tbar : true,
		showTitle : true,
		isPackedVisible : false,
		btnAddExisting : false,
		btnRemoveVisible : false,
		btnUnpackVisible : false
	});
	
	var _this = this;
	
	
	this.stockSolutionForm.onSaved.attach(function(sender, stockSolution){
		var onSuccess2 = function(sender, proposals){
			_this.stockSolutionForm.load(EXI.proposalManager.getStockSolutionById(_this.stockSolutionId));	
			_this.panel.setLoading(false);
		};
		_this.panel.setLoading("Updading proposal information");
		EXI.getDataAdapter({onSuccess : onSuccess2}).proposal.proposal.update();
//		
	});
	
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

StockSolutionMainView.prototype.getPanel = MainView.prototype.getPanel;

StockSolutionMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'anchor'
	    },
	    defaults : {
			anchor : '100%',
			hideEmptyLabel : false },
	    margin : 30,
		bodyStyle : {
			"background-color" : "#E6E6E6" 
		},
		 items: [this.stockSolutionForm.getPanel([])]
	});
	
};


StockSolutionMainView.prototype.load = function(stockSolutionId) {
	this.stockSolutionId = stockSolutionId;
	
	this.stockSolutionForm.load(EXI.proposalManager.getStockSolutionById(stockSolutionId));	
	this.panel.setTitle("Stock Solutions");
};
