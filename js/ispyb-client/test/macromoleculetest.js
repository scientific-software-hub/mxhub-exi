function MacromoleculeTest(){
	AdapterTest.call(this);
}

MacromoleculeTest.prototype.init = AdapterTest.prototype.init;
MacromoleculeTest.prototype.authenticate = AdapterTest.prototype.authenticate;

MacromoleculeTest.prototype.getDataAdapter = function(token, callback){
	return new MacromoleculeSaxsDataAdapter({
            proposal 	: this.credential.proposal,
            token 	    : this.token,
            url 	    : this.credential.url,
	        async	    : false,
            onSuccess	: callback
        });
};

MacromoleculeTest.prototype.test = function(token){
	var _this = this;
	QUnit.test( "MacromoleculeTest:getMacromolecules", function( assert ) {
		    	function callback(sender, data){
			    assert.ok((data.length>0), "MacromoleculeSaxsDataAdapter.getMacromolecules(): There's at least one macromolecule.");
			}
        	_this.getDataAdapter(_this.token, callback).getMacromolecules();
	});
};


// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.MacromoleculeTest = MacromoleculeTest;
