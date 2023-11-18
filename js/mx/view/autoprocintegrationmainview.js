/**
* Main view for autoprocessing. It displays a grid with a summary of the information of autoprocessing and phasing
* On the right it displays a panel with the plots: completeness, rfacor, cc2, etc.. as well as the list of attachments
*
* @class AutoProcIntegrationMainView
* @constructor
*/
function AutoProcIntegrationMainView() {
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	MainView.call(this);
	var _this = this;
    this.id = BUI.id();

	this.autoProcIntegrationGrid = new AutoProcIntegrationGrid({height:310});    
    this.autoProcIntegrationPlots = new AutoProcIntegrationPlots();
    this.autoProcIntegrationAttachmentsGrid = new AutoProcIntegrationAttachmentGrid();
}

AutoProcIntegrationMainView.prototype.getPanel = MainView.prototype.getPanel;


AutoProcIntegrationMainView.prototype.getContainer = function() {

    var hPanel = Ext.create('Ext.container.Container', {
        margin : 20,
        cls : 'border-grid',
        layout : 'hbox',
        items : [this.autoProcIntegrationPlots.getPanel(),
                this.autoProcIntegrationAttachmentsGrid.getPanel()
        ]
    });

	this.panel = Ext.create('Ext.container.Container', {
        layout: {
            type: 'fit'
        },       
        items: [
            this.autoProcIntegrationGrid.getPanel(),
            hPanel
        ]
    });
    return this.panel;
};

/**
* It loads autoproc.getViewByDataCollectionId from autoprocessingdataadapter and call to loadAttachments
* @method load
*/
AutoProcIntegrationMainView.prototype.load = function(data) {
	var _this = this;
	this.panel.setTitle("Autoprocessing");
	
	this.autoProcIntegrationGrid.load(data);
    this.autoProcIntegrationPlots.load(data);

    if (data.length == 1) {      
        this.autoProcIntegrationAttachmentsGrid.panel.setLoading();
        var onSuccess = function (sender,attachments) {            
            _this.autoProcIntegrationAttachmentsGrid.panel.setLoading(false);
            if (attachments){
                _this.autoProcIntegrationAttachmentsGrid.load(_.uniqBy(_.flatten(attachments),"autoProcProgramAttachmentId"));
            }
        }         
        EXI.getDataAdapter({onSuccess : onSuccess}).mx.autoproc.getAttachmentListByautoProcProgramsIdList(_.map(data,'v_datacollection_summary_phasing_autoProcProgramId'));
    }
};


