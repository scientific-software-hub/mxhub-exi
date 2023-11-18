function AutoProcIntegrationAttachmentGrid(args) {
	this.id = BUI.id();	
	this.maxHeight = 300;
}

AutoProcIntegrationAttachmentGrid.prototype.load = function(data) {	
	var _this = this;
    if (data){
		data.sort(function(a, b) {
			var textA = a.fileName.toUpperCase();
			var textB = b.fileName.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});	

		/** URL to attachment */
		_.forEach(data, function(row){
			/** Get the extension of the file name */
			extension = row.fileName.split(".").pop()
			if (extension == "pdf") {
				row.url = EXI.getDataAdapter().mx.autoproc.getAttachmentUrlPdf(row.autoProcProgramAttachmentId);
			} else if (extension == "html"){
				row.url = EXI.getDataAdapter().mx.autoproc.getAttachmentUrlHtml(row.autoProcProgramAttachmentId);
			} else {
				row.url = EXI.getDataAdapter().mx.autoproc.getAttachmentUrl(row.autoProcProgramAttachmentId);
			}
		})
		var html = "";
		dust.render("files.autoprocintegrationgrid.template", data, function(err, out) { 			
			html = out;
		});
		
		$("#" + _this.id).html(html);
    }
};

AutoProcIntegrationAttachmentGrid.prototype.getPanel = function() {
	var _this = this;
	this.store = Ext.create('Ext.data.Store', {
		fields : ["fileName"]
	});
    	
	this.panel = Ext.create('Ext.panel.Panel', {
		id : this.id + "panel",
		title : 'Attachments',
		store : this.store,
		cls : 'border-grid',
		margin : 5,
		overflow :'auto',
        height : 500,
		items : [ 		
					{
						html : '<div style="height:500px;" id="'+ _this.id +'"></div>'

					}                   
		],
		flex : 1
	});

	return this.panel;
};

