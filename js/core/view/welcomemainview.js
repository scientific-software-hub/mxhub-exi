function WelcomeMainView() {
	this.icon = '../images/icon/rsz_ic_home_black_24dp.png';
	MainView.call(this);
	this.title = "Welcome";
	this.closable = true;		
}

WelcomeMainView.prototype.getPanel = MainView.prototype.getPanel;


WelcomeMainView.prototype.getContainer = function() {
	return {
		  layout: {
		        type: 'fit'
		    },
		items : [
		         	{
		         		html : "<iframe style='width:900px;height:900px;' frameBorder='0' src='../html/welcome.html'></iframe>",
		         		margin : '50 0 0 50'
		         	}
		]
	};
};


WelcomeMainView.prototype.load = function() {
	
};

// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.WelcomeMainView = WelcomeMainView;
