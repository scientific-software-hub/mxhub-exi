/*function SelectionMenu() {

	
	
}

SelectionMenu.prototype.openViewer = function() {
	var ids = exiSAXS.localExtorage.selectedSubtractionsManager.getDataCollectionIds();
	location.hash = "/datacollection/dataCollectionId/" + ids.toString() +"/primaryviewer";
};

SelectionMenu.prototype.openMerge = function() {
	var ids = exiSAXS.localExtorage.selectedSubtractionsManager.getDataCollectionIds();
	location.hash = "/datacollection/dataCollectionId/" + ids.toString() +"/merge";
};

SelectionMenu.prototype.clear = function() {
	exiSAXS.localExtorage.selectedSubtractionsManager.clear();
	
};


SelectionMenu.prototype.getPanel = function() {
	var _this = this;
	var tb = Ext.create('Ext.toolbar.Toolbar', {
	    height : 50,
	   
	    items: [
	        {
	            xtype: 'splitbutton',
	            text : 'Actions',
	            menu: new Ext.menu.Menu({
	                items: [
	                    	{text: 'Open Viewer', handler: function(){ _this.openViewer(); }},
	                    	{text: 'Open Merging Tool', handler: function(){  _this.openMerge(); }},
	                    	"-",
	                    	{text: 'Create new Project from Selection', handler: function(){ alert("Item 2 clicked"); }},
	                    	"-",
	                    	{text: 'Discard Selection', handler: function(){_this.clear(); }}
	                    
	                    
	                ]
	            })
	        }
	    ]
	});
	return tb;
};
*/
