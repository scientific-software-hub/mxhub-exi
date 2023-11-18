
function Credential(username, roles, token, url, exiUrl,activeProposals, tokenExpires, properties) {
	this.username = username.toLowerCase();
	this.roles = roles;
	this.url = url;
	this.exiUrl = exiUrl;
	this.token = token;
	this.activeProposals = activeProposals;
    this.tokenExpires = tokenExpires;
	this.properties = properties;
   
}

Credential.prototype.isManager = function() {
	return this._checkRole("manager");
};

Credential.prototype.isLocalContact = function() {
	return this._checkRole("localcontact");
};

Credential.prototype._checkRole = function(role) {
	return JSON.stringify(this.roles).toLowerCase().indexOf(role) != -1;
};

Credential.prototype.getRoles = function() {
	return this.roles;
};

Credential.prototype.hasRole = function(role) {
	return this._checkRole(role);
};

/**
 * Checks if it has not expired yet
 */
Credential.prototype.isValid = function() {
    return  this.timeToExpire() > 0;
};

/**
 * Checks if it has not expired yet
 */
Credential.prototype.timeToExpire = function() {
    return  moment.duration(moment(this.tokenExpires).diff(moment())).asHours();
};
