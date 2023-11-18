/**
* It shows a summary about the phasing steps. Basically, one line per space group 
*
* @class FileManagerPhasingGrid
* @constructor
*/
function FileManagerPhasingGrid(args) {	
    this.onSelect = new Event(this);
}

FileManagerPhasingGrid.prototype.load = function(data) {
    this.data = data;
	this.store.loadData(data);
};

FileManagerPhasingGrid.prototype.findPDBMatch = function(mapFilePath) {
    for (var i = 0; i < this.data.length; i++) {
        var element = this.data[i];
        if (element.fileName.endsWith(".pdb")){
            /*var name = element.fileName.substring(0,element.fileName.lastIndexOf("."));
            var nameMap = mapFilePath.substring(0,mapFilePath.lastIndexOf("."));
            if (name == nameMap){*/
                return element;
            //} 
            
        }
    }
	
};

FileManagerPhasingGrid.prototype.getPanel = function() {
	var _this = this;
	this.store = Ext.create('Ext.data.Store', {
		fields : [  
                    'fileType',
                    'phasingProgramAttachmentId',
                    'filePath',
                    'phasingPrograms',
                    'fileName']
	});
    
   
        
    
	this.panel = Ext.create('Ext.grid.Panel', {
		title : 'Files',
		store : this.store,
        flex : 0.3,
        height : 600,
        cls : 'border-grid',
       	emptyText : "No files found",

		layout : 'fit',
        margin : "0 5 0 5",
        viewConfig : {
                stripeRows : true                   
            },
		columns : [ 
                    {
                        text : 'fileName',
                        flex : 1,
                        dataIndex : 'fileName'
                    },
                    {
                        text : 'Viewer',
                        flex : 1,                      
                        dataIndex : 'filePath',
                        renderer : function(grid, e, record){
                            var pdb = null;
                            var href= null;
                            if (record.data.fileName.endsWith(".map")){
                                pdb = _this.findPDBMatch(record.data.fileName);
                                if (pdb != null){
                                    
                                    pdb = EXI.getDataAdapter().mx.phasing.downloadPhasingFilesByPhasingAttachmentId(pdb.phasingProgramAttachmentId);
                                    var map = EXI.getDataAdapter().mx.phasing.downloadPhasingFilesByPhasingAttachmentId(record.data.phasingProgramAttachmentId);                                     
                                    href= "viewers/uglymol/1mru.html?pdb=" + pdb + "&map="+map;
                                    return "<a target='_blank' style='showme openGridButton' href='" + href+"'><div style='text-align:center;color:white;width:60px;background-color:#3892d3;'>VIEWER</div></a>";   
                                    
                                }
                            }
                            
                            if (record.data.fileName.endsWith(".pdb")){
                                pdb = _this.findPDBMatch(record.data.fileName);
                                if (pdb != null){                                    
                                    pdb = EXI.getDataAdapter().mx.phasing.downloadPhasingFilesByPhasingAttachmentId(pdb.phasingProgramAttachmentId);                                                                         
                                    href= "viewers/pv/index.html?pdb=" + pdb;
                                    return "<a target='_blank' style='showme openGridButton' href='" + href+"'><div style='text-align:center;color:white;width:60px;background-color:#3892d3;'>VIEWER</div></a>";   
                                    
                                }
                            }
                        }
                    },
                    {
                        text : 'filePath',
                        flex : 1,
                        hidden : true,
                        dataIndex : 'filePath'
                    },
                    {
                        xtype:'actioncolumn',
                        flex : 0.3,
                        text : 'Download',
                        items: [{
                            icon: '../images/icon/ic_get_app_black_24dp.png',  // Use a URL in the icon config
                            tooltip: 'Download',
                            handler: function(grid, rowIndex, colIndex) {
                                
                                  window.open(EXI.getDataAdapter().mx.phasing.downloadPhasingFilesByPhasingAttachmentId(grid.store.getAt(rowIndex).data.phasingProgramAttachmentId));
                                
                            }
                        }]
                    }
                ]
	});
	return this.panel;
};


