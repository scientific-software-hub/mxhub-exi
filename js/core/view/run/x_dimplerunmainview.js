function DimpleRunMainView() {
	this.title = "Experiment";
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	this.queueGridList = [];

	this.id = BUI.id();
	RunMainView.call(this);
}

DimpleRunMainView.prototype.getPanel = RunMainView.prototype.getPanel;
DimpleRunMainView.prototype.getOutputPanel = RunMainView.prototype.getOutputPanel;
DimpleRunMainView.prototype.getTabs = RunMainView.prototype.getTabs;
DimpleRunMainView.prototype.getContainer = RunMainView.prototype.getContainer;
DimpleRunMainView.prototype.load = RunMainView.prototype.load;

DimpleRunMainView.prototype.getFilesGrid = function() {
	var _this = this;
	
	this.filesStore = Ext.create('Ext.data.Store', {
	    fields:['name', 'targetId']
	});
	
	var selModel = Ext.create('Ext.selection.RowModel', {
		allowDeselect : true,
		listeners : {
			selectionchange : function(sm, selections) {
				console.log(selections[0].data);
				var onSuccess = function(sender, content){
					document.getElementById(_this.id + "display").innerHTML = "<textarea rows='100' cols='100'> " + content + "</textarea>" ;
				};
				if (selections[0].data.name.indexOf(".mtz") == -1){
					EXI.getDataAdapter({onSuccess:onSuccess}).exi.offline.getFileContent(selections[0].data.targetId);
				}
				else{
					onSuccess(this, "No text available");
				}
			}

		} });
	
	return  Ext.create('Ext.grid.Panel', {
	    title: 'Files',
	    store:this.filesStore,
	    selModel : selModel,
	    cls : 'border-grid',
	    height : 400,
	    columns: [
	        { text: 'Name',     dataIndex: 'name', flex : 1}
	    ]
	});
};






DimpleRunMainView.prototype.getMainPanel = function() {
	var store = Ext.create('Ext.data.Store', {
	    fields:['key', 'value']
	});
	
	this.generalGrid = Ext.create('Ext.grid.Panel', {
	    title: 'General',
	    store:store,
	    layout : 'fit',
	    columns: [
	        { text: 'Name',     dataIndex: 'name' },
	        { text: 'Seniority', dataIndex: 'seniority' }
	    ],
	    flex : 1
	});
	
	
	return {
		tabConfig : {
			title : 'Dimple'
		},
		items : [ {
							xtype : 'container',
//							layout : 'fit',
							height : 700,
							cls : 'border-grid',
							items : [ 
							         {
											xtype : 'container',
											layout : 'hbox',
											items : [
											         {
															xtype : 'container',
															layout : 'fit',
															flex : 0.4,
															margin: 5,
															items : [
																	this.getFilesGrid(),
																	{
																		html : "<br />"
																	},
																	 {
															        	 html : '<div id="' + this.id +'blobs";><div>'
															        	 
															         }
															]
											         },
											         {
															xtype : 'container',
															layout : 'fit',
															flex : 0.6,
															margin: 5,
															height : 400,
															cls : 'border-grid',
															items : [
															         {
															        	 html : '<div id="' + this.id +'display";><div>'
															        	 
															         }
													         ]
											         }
									         ]
							         },
							         {
											xtype : 'container',
											margin: 5,
											height : 210,
											layout : 'fit',
											flex : 1,
//											cls : 'border-grid',
											items : [
											         {
											        	 html : '<div style="height:200px"  id="' + this.id +'snapshots";><div>'
											        	 
											         }
									         ]
							         }
							 ]
			         
			}
		]
	};
};

DimpleRunMainView.prototype.loadBlobs = function(job) {
	var blobs = [];
	var i = 0;
	for (i = 0; i < job.output.length; i++) {
		if (job.output[i].type == "blob"){
			blobs.push(job.output[i]);
		}
	}
	
	/** Rendering blobs **/
//	var table = document.createElement("table");
	var container = document.createElement("div");
	var table = document.createElement("table");
	var tr = document.createElement("tr");
	for (i = 0; i < blobs.length; i++) {
		var td = document.createElement("td");
		var img = document.createElement("img");
		img.setAttribute("src", EXI.getDataAdapter().exi.offline.getFileImage(blobs[i].targetId));
		img.setAttribute("height", "180px");
		img.setAttribute("width", "180px");
		img.setAttribute("hspace", "10");
		
		img.setAttribute("onclick", "window.open(this.src)");
		td.appendChild(img);
		tr.appendChild(td);
		
		
	}
	table.appendChild(tr);
	document.getElementById(this.id + "snapshots").innerHTML =  table.innerHTML;
//	document.getElementById(this.id + "blobs").innerHTML = table.innerHTML;
};

DimpleRunMainView.prototype.loadFiles = function(job) {
	var files = [];
	for (var i = 0; i < job.output.length; i++) {
		if (job.output[i].type != "blob"){
			files.push(job.output[i]);
		}
	}
	this.filesStore.loadData(files);
};



DimpleRunMainView.prototype.loadMain = function(run) {
	console.log(run);
	if (run != null){
		if (run.jobs != null){
			if (run.jobs.length > 0){
				for (var i = 0; i < run.jobs.length; i++) {
					this.loadBlobs(run.jobs[i]);
					this.loadFiles(run.jobs[i]);
				}
			}
		}
	}
};