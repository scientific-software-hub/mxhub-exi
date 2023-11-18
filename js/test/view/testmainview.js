function TestMainView(crystalId) {
	// this.queueGridList = [];
	MainView.call(this);
    this.id= BUI.id();
	this.crystalId = crystalId;
	
	
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

TestMainView.prototype.getPanel = MainView.prototype.getPanel;

TestMainView.prototype.getContainer = function() {
	var _this = this;
	var panel1 = Ext.create('Ext.panel.Panel', {
		title: '1) This is a Ext Sencha Panel with HTML an element',
		width: 600,
		html: '<p>World!</p>'
	
	});

	var panel2 = Ext.create('Ext.panel.Panel', {
    title: '2) This is a panel with Ext Sencha Element',
    width: 600,
    height: 300,   
    layout: {
        type: 'vbox',       // Arrange child items vertically
        align: 'stretch',    // Each takes up full width
        padding: 5
    },
    items: [ {
            fieldLabel: 'Data item',
            xtype: 'textfield'
        }]
    });
	var panel3 = Ext.create('Ext.panel.Panel', {
		title: '1) This is a Ext Sencha Panel with a DUST template inside',
		width: 600,
		html: '<div id=' + _this.id +'></div>'
	
	});

	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'vbox'
	    },
	    margin : 15,
	    border: 1,
	    defaults: {
	        labelWidth: 80,
	        flex: 1,
	    },
	    items: [
			panel1, panel2, panel3

		]
	});
};



TestMainView.prototype.load = function(name) {
	if (name){
		this.panel.setTitle(name);
		var data = [
		{
			"city": "New York", 
			"growth_from_2000_to_2013": "4.8%", 
			"latitude": 40.7127837, 
			"longitude": -74.0059413, 
			"population": "8405837", 
			"rank": "1", 
			"state": "New York"
		}, 
		{
			"city": "Los Angeles", 
			"growth_from_2000_to_2013": "4.8%", 
			"latitude": 34.0522342, 
			"longitude": -118.2436849, 
			"population": "3884307", 
			"rank": "2", 
			"state": "California"
		}, 
		{
			"city": "Chicago", 
			"growth_from_2000_to_2013": "-6.1%", 
			"latitude": 41.8781136, 
			"longitude": -87.6297982, 
			"population": "2718782", 
			"rank": "3", 
			"state": "Illinois"
		}, 
		{
			"city": "Houston", 
			"growth_from_2000_to_2013": "11.0%", 
			"latitude": 29.7604267, 
			"longitude": -95.3698028, 
			"population": "2195914", 
			"rank": "4", 
			"state": "Texas"
			}];
				
	    dust.render("testmainview.template", data, function(err, out){		
        	html = out;
     	});	
	}
	else{
		this.panel.setTitle("This is TestMainView Widget");	
	}
			
};