var Client = require('fabric-client');
var fs = require('fs');
var path = require('path');

var channel_name = 'myc';

var client = new Client();

var org1 = "Org1MSP";

var apeers = [{ url: "grpc://10.51.235.65:7051", eventurl: "grpc://10.51.235.65:7053" }];

console.log("Calling getAdmin");
admin = getAdmin();

function getAdmin(client, userOrg, pathOrg) {

	var keyPath = '/home/fbadmin/FabricDevModeTest/fabric-samples/chaincode-docker-devmode/msp/keystore';
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = '/home/fbadmin/FabricDevModeTest/fabric-samples/chaincode-docker-devmode/msp/signcerts';
	var certPEM = readAllFiles(certPath)[0];
	var cryptoSuite = Client.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: "/hfc-test-kvs/" + pathOrg }));
		client.setCryptoSuite(cryptoSuite);
	}
	console("Got admin successfully!");
	return Promise.resolve(client.createUser({
		username: 'peer' + userOrg + 'Admin',
		mspid: pathOrg,
		cryptoContent: {
			privateKeyPEM: keyPEM.toString(),
			signedCertPEM: certPEM.toString()
		}
	}));

}

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir, file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}