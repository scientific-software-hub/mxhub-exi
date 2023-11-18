function ExperimentWelcomeMainView() {
	this.icon = '../images/icon/rsz_ic_home_black_24dp.png';

	MainView.call(this);
	this.title = "Welcome";
	this.closable = false;
}

ExperimentWelcomeMainView.prototype.getPanel = MainView.prototype.getPanel;
ExperimentWelcomeMainView.prototype.getContainer = MainView.prototype.getContainer;

ExperimentWelcomeMainView.prototype.getContainer = function() {
	return  Ext.createWidget('panel',
			{
				plain : true,
				margin : '10',
				layout : 'fit',
				items : [
					{
						tabConfig : {
							title : 'Welcome'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							padding : 20,
							margin : 0,
							cls : 'border-grid',
							items : [ 
							        
							         {
							        	 html : '<div class="landing-title" ><h2>Designing your experiment on ISPyB</h2></div>'
							         },
							         {
							        	 html : '<div class="landing-text">A experiment is a set of measurements of samples.</div><br/>',
							        	 margin : '0 0 0 20'
							         },
							         {
							        	xtype : 'container',
							        	layout : 'hbox',
							        	cls : 'option-bar-menu',
							        	items :[
							        	    
										         {
										        	 xtype : 'button',
										        	 cls : 'square-option',
										        	 maxWidth : 200,
										        	 minWidth : 200,
										        	 margin : '0 0 0 150',
										        	 height : 100,
										        	 text : '<div class="square-option-text"; >Create a new Experiment</div>',
										        	 icon : '../images/icon/add.png',
										        	 iconAlign : 'top',
										        	 handler : function(){
										        		 location.hash = '/prepare/designer';
										        	 }
										         }]
							         }
							       
							        
							]
						}
					
						]
					}
			]});
	};


ExperimentWelcomeMainView.prototype.load = function() {
	
};
