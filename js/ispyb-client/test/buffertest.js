function BufferTest(){
	AdapterTest.call(this);
}

BufferTest.prototype.init = AdapterTest.prototype.init;
BufferTest.prototype.authenticate = AdapterTest.prototype.authenticate;

BufferTest.prototype.getDataAdapter = function(token, callback){
	return new BufferSaxsDataAdapter({
            proposal 	: this.credential.proposal,
            token 	: this.token,
            url 	: this.credential.url,
	    async	: false,
            onSuccess	: callback
        });
};

BufferTest.prototype.test = function(token){
	var _this = this;
	QUnit.test( "BufferTest:getBuffers", function( assert ) {
		    	function callback(sender, data){
			    assert.ok((data.length>0), "BufferSaxsDataAdapter.getBuffers(): There's at least one buffer.");
			}
        		_this.getDataAdapter(_this.token, callback).getBuffers();
	});

};

