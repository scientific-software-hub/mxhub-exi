/** Super class for testing **/
function AdapterTest(){
	this.token = null;
	this.credential = null;
}

AdapterTest.prototype.authenticate = function(username, password, url){
		var _this = this;

		if (password == null){
			 var p = prompt("Please enter the password for proposal " +  Config.credentials[0].username, "");
            if (p != null) {
                 Config.credentials[0].password = p;
                 password = p;
            }
			
		}
		function onAuthenticated(sender, data){
			_this.token = data.token;
    		}
		var authenticationDataAdapter = new AuthenticationDataAdapter({
			onSuccess	: onAuthenticated,
			async	  	: false,
			url		:  url
	    	});
            
	    authenticationDataAdapter.authenticate(username, password, url);


};

AdapterTest.prototype.init = function(){
	this.credential = Config.credentials[0];
	this.authenticate(this.credential.username, this.credential.password, this.credential.url);
	if (this.token != null){
		this.test(this.token);
	}
	else{
		alert("Authentication failed");
	}
};

AdapterTest.prototype.test = function(token){


};
