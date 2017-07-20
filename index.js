module.exports = function (g_options, logger) {
	var deploy_cc = require('./deploy_cc.js')(logger);
	var invoke_cc = require('./invoke_cc.js')(g_options, logger);
	var query_cc = require('./query_cc.js')(logger);

	var fcw = {};

	// ------------------------------------------------------------------------
	// Chaincode Functions
	// ------------------------------------------------------------------------

	// Install Chaincode
	fcw.install_chaincode = function (obj, options, cb_done) {
		deploy_cc.install_chaincode(obj, options, cb_done);
	};

	// Instantiate Chaincode
	fcw.instantiate_chaincode = function (obj, options, cb_done) {
		deploy_cc.instantiate_chaincode(obj, options, cb_done);
	};

	// Invoke Chaincode
	fcw.invoke_chaincode = function (obj, options, cb_done) {
		invoke_cc.invoke_chaincode(obj, options, cb_done);
	};

	// Query Chaincode
	fcw.query_chaincode = function (obj, options, cb_done) {
		query_cc.query_chaincode(obj, options, cb_done);
	};

	return fcw;
};