Skip to content
This repository
Search
Pull requests
Issues
Marketplace
Gist
 @nitesh7sid
 Sign out
 Watch 1
  Star 0
  Fork 0 shubhamvrkr/hyperledger-setup
 Code  Issues 0  Pull requests 0  Projects 0  Wiki Insights 
Branch: master Find file Copy pathhyperledger-setup/Server/server.js
76ac2a8  a day ago
 root setup
0 contributors
RawBlameHistory     
579 lines (405 sloc)  14.9 KB
var Client = require('fabric-client');
var fs = require('fs');
var path = require('path');
var requestify = require('requestify');
var JSONB = require('json-buffer')

var channel_name = 'testchainid';

var client = new Client();
var caRootsPath = "/fabric-test/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
let data = fs.readFileSync(caRootsPath);
let caroots = Buffer.from(data).toString();
//var _configtxProto = grpc.load(__dirname + '/protos/common/configtx.proto').common;

var org1 = "Org1MSP";
var org2 = "Org2MSP"
var org3 = "Org3MSP"

var genesis_block = null;
var config =null;
var signatures = [];

console.log("\nStarting..")

var orderer = client.newOrderer(
		"grpcs://localhost:7050",
		{
			'pem': caroots,
			'ssl-target-name-override': 'orderer.example.com'
		}
);

console.log("\nOrderer Object: ",orderer)
var apeers = [{url:"grpcs://localhost:7051",eventurl:"grpcs://localhost:7053"},{url:"grpcs://localhost:8051",eventurl:"grpcs://localhost:8053"}];

//joinChannel(org1,'org1',apeers)
//createChannel();
//getChannelInfo();
//getGenesisBlock(org1,'org1')
//addOrganizationtoChannel('org2',org2);
//test();
getChannelConfig()
function test(){

	let envelope_bytes = fs.readFileSync('/fabric-test/channel-artifacts/channel.tx');
	console.log("\n",envelope_bytes)
	config = client.extractChannelConfig(envelope_bytes);
	console.log("\n",config)


}

function getChannelConfig(){

	var signatures = [];
	
	var channel = client.newChannel(channel_name);
	channel.addOrderer(orderer)
	Client.newDefaultKeyValueStore({
		
		path: "/hfc-test-kvs/"+'orderer'
		
	}).then((store) => {
	
		console.log("\nRegistering orderer admin")
		client.setStateStore(store);
		//return getSubmitter(client, true, orgPath,orgName);
		return getOrdererAdmin(client);
		
	}).then((admin) => {
	
		console.log('\nSuccessfully enrolled orderer');
		tx_id = client.newTransactionID();
		let request = {
			txId : 	tx_id
		};
		return channel.getChannelConfig();
		
	}).then((envelope) =>{
	
		//console.log("\n",envelope)
		//config = client.extractChannelConfig(envelope);
		console.log("\n",envelope.config.channel_group.groups.map.Consortiums.value.groups)
		
	})


}


function addOrganizationtoChannel(orgPath,orgName){

	var signatures = [];
	
	var channel = client.newChannel(channel_name);
	channel.addOrderer(orderer)
	Client.newDefaultKeyValueStore({
		
		path: "/hfc-test-kvs/"+orgName
		
	}).then((store) => {
	
		console.log("\nRegistering orderer admin")
		client.setStateStore(store);
		return getSubmitter(client, true, orgPath,orgName);
		//return getOrdererAdmin(client);
		
	}).then((admin) => {
	
		console.log('\nSuccessfully enrolled '+orgPath+' \'admin\'');
		tx_id = client.newTransactionID();
		let request = {
			txId : 	tx_id
		};
		return channel.getGenesisBlock(request);
		
	}).then((block) =>{
	
		console.log("Block: ",block)

	})
		
		
		/*let envelope_bytes = fs.readFileSync('/fabric-test/channel-artifacts/newgenesis.block');
		config = client.extractChannelConfig(envelope_bytes);
		var signature = client.signChannelConfig(config);
		var string_signature = signature.toBuffer().toString('hex');
		signatures.push(string_signature);
		signatures.push(string_signature);
		let tx_id = client.newTransactionID();
					
		var request = {
			config: config,
			signatures : signatures,
			name : "testchainid",
			orderer : orderer,
			txId  : tx_id
		};
		// send create request to orderer
		return client.updateChannel(request);
		
	}).then((result) => {
				
					console.log('\ncompleted the update channel request');
					console.log('\nresponse: ',result);
					console.log('\nSuccessfully updated the channel.');
					
					if(result.status && result.status === 'SUCCESS') {
						console.log('\nSuccessfully updated the channel...SUCCESS 200');
					} else {
						console.log('\nFailed to updated the channel. ');
					}
		}, (err) => {
					console.log('\nFailed to updated the channel: ' , err);
					
	}).then((nothing) => {
					console.log('\nSuccessfully waited to make sure new channel was updated.');
		}, (err) => {
					console.log('\nFailed to sleep due to error: ', err);
					
	});*/
		
}

function getGenesisBlock(orgName,orgPath){

	var channel = client.newChannel(channel_name);
	channel.addOrderer(orderer)
	Client.newDefaultKeyValueStore({
		
		path: "/hfc-test-kvs/"+orgName
		
	}).then((store) => {
	
		console.log("\nRegistering orderer admin")
		client.setStateStore(store);
		return getSubmitter(client, true, orgPath,orgName);
		
	}).then((admin) => {
	
		console.log('\nSuccessfully enrolled '+orgPath+' \'admin\'');
		
		tx_id = client.newTransactionID();
		let request = {
			txId : 	tx_id
		};
		console.log('\Getting the genesis block from orderer');
		
		return channel.getGenesisBlock(request);
		
	}).then((block) =>{
	
		console.log("\n",block)
		buf  = new Buffer(block)
		console.log("\n",buf)

	})
}

function getChannelInfo(){

	data = fs.readFileSync("/fabric-test/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/tlscacerts/tlsca.org3.example.com-cert.pem");
	var channel = client.newChannel(channel_name);
	var peer = client.newPeer(
							"grpcs://localhost:11051",
							{
								pem: Buffer.from(data).toString(),
								'ssl-target-name-override': "peer0.org3.example.com"
							}
	);
	Client.newDefaultKeyValueStore({
		
		path: "/hfc-test-kvs/"+org3
		
	}).then((store) => {
	
		console.log("\nRegistering orderer admin")
		client.setStateStore(store);
		return getSubmitter(client, true, "org3",org3)
		
	}).then((admin) => {
	
		console.log('\nSuccessfully enrolled org1 \'admin\'');

		console.log('\Getting the channel info block from orderer');
		
		return channel.queryInfo(peer)
		
	}).then((info) =>{
	
		console.log('\Channel info: ',info);
	
	});
	
					
	

}
function createChannel(){



			Client.newDefaultKeyValueStore({
					
					path: "/hfc-test-kvs/"+"orderer"
					
			}).then((store) => {

					console.log("\nCreate a storage for Org1MSP certs");
					
					client.setStateStore(store);
					var cryptoSuite = Client.newCryptoSuite();
					cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: "/hfc-test-kvs/"+"orderer"}));
					client.setCryptoSuite(cryptoSuite);
					
					console.log("\nEnrolling Admin for Orderer");
					
					return getOrdererAdmin(client);
					
			}).then((admin) =>{
				
						console.log('\nSuccessfully enrolled user \'admin\' for orderer');

						console.log('\nread the mychannel.tx file for signing');
						
						let envelope_bytes = fs.readFileSync('/fabric-test/channel-artifacts/secondchannel.tx');
						
						config = client.extractChannelConfig(envelope_bytes);
						
						console.log('\nSuccessfull extracted the config update from the configtx envelope');
						
						client._userContext = null;
						
						console.log("\nEnrolling Admin for Org1MSP");
						
						return getSubmitter(client, true, 'org1',org1);
								
								
			}).then((admin) => {
				
				
					console.log('\nSuccessfully enrolled user \'admin\' for org1');
					
					console.log('\nSigning the mychannel.tx artifacts by Org1 admin');

					var signature = client.signChannelConfig(config);
					var string_signature = signature.toBuffer().toString('hex');
					
					console.log('\nSuccessfully signed config update');
					
					signatures.push(string_signature);
					signatures.push(string_signature);
					
					client._userContext = null;
					
					
					console.log("\nEnrolling Admin for Org3MSP");
					
					return getSubmitter(client, true, 'org3',org3);
					
			}).then((admin) => {
				
					console.log('\nSuccessfully enrolled user \'admin\' for org2');

					console.log('\nSigning the mychannel.tx artifacts by Org2 admin');
					
					var signature = client.signChannelConfig(config);
					
					console.log('\nSuccessfully signed config update');
					
					signatures.push(signature);
					signatures.push(signature);
					
					client._userContext = null;
					console.log("\nEnrolling Admin for Orderer for final create channel transaction");
					
					return getOrdererAdmin(client);
					
			}).then((admin) => {
				
					console.log('\nSuccessfully enrolled user \'admin\' for orderer');
					the_user = admin;

					console.log('\nSigning the mychannel.tx artifacts by orderer admin');
					
					var signature = client.signChannelConfig(config);
					console.log('\nSuccessfully signed config update');
					
					signatures.push(signature);
					signatures.push(signature);

					console.log('\ndone signing');

					// build up the create request
					
					let tx_id = client.newTransactionID();
					
					var request = {
						config: config,
						signatures : signatures,
						name : channel_name,
						orderer : orderer,
						txId  : tx_id
					};

					// send create request to orderer
					return client.createChannel(request);
					
			}).then((result) => {
				
					console.log('\ncompleted the create channel request');
					console.log('\nresponse: ',result);
					console.log('\nSuccessfully created the channel.');
					
					if(result.status && result.status === 'SUCCESS') {
						console.log('\nSuccessfully created the channel...SUCCESS 200');
					} else {
						console.log('\nFailed to create the channel. ');
					}
				}, (err) => {
					console.log('\nFailed to create the channel: ' , err);
					
			}).then((nothing) => {
					console.log('\nSuccessfully waited to make sure new channel was created.');
				}, (err) => {
					console.log('\nFailed to sleep due to error: ', err);
					
			});

}
 
function joinChannel(orgName,orgPath,peers){


	var channel = client.newChannel(channel_name);
	channel.addOrderer(orderer)
	var targets = [],
	eventhubs = [];
	Client.newDefaultKeyValueStore({
		
		path: "/hfc-test-kvs/"+orgName
		
	}).then((store) => {
	
		console.log("\nRegistering orderer admin")
		client.setStateStore(store);
		return getSubmitter(client, true, orgPath,orgName);
		
	}).then((admin) => {
	
		console.log('\nSuccessfully enrolled '+orgPath+' \'admin\'');
		
		tx_id = client.newTransactionID();
		let request = {
			txId : 	tx_id
		};
		console.log('\Getting the genesis block from orderer');
		return channel.getGenesisBlock(request);
		
	}).then((block) =>{
	
		console.log('Successfully got the genesis block',block);
		genesis_block = block;

		// get the peer org's admin required to send join channel requests
		client._userContext = null;
		
		console.log('Enrolling org1 admin');
		
		return getSubmitter(client, true, orgPath,orgName);
		
	}).then((admin) => {
	
		console.log('Successfully enrolled org:' + orgName + ' \'admin\'');
		
		the_user = admin;
		for (var i=0;i<peers.length;i++) {
		
			let peer = peers[i];
			data = fs.readFileSync("/fabric-test/crypto-config/peerOrganizations/"+orgPath+".example.com/peers/peer"+i+"."+orgPath+".example.com/msp/tlscacerts/tlsca."+orgPath+".example.com-cert.pem");
			targets.push(
					client.newPeer(
							peer.url,
							{
								pem: Buffer.from(data).toString(),
								'ssl-target-name-override': "peer"+i+"."+orgPath+".example.com"
							}
					)
			);
			let eh = client.newEventHub();
			eh.setPeerAddr(
				peer.eventurl,
				{
							pem: Buffer.from(data).toString(),
							'ssl-target-name-override': "peer"+i+"."+orgPath+".example.com"
				}
			);
			
			eh.connect();
			eventhubs.push(eh);
		
		}
		var eventPromises = [];
		eventhubs.forEach((eh) => {
		
			let txPromise = new Promise((resolve, reject) => {
				let handle = setTimeout(reject, 30000);

				eh.registerBlockEvent((block) => {
					clearTimeout(handle);
					// in real-world situations, a peer may have more than one channel so
					// we must check that this block came from the channel we asked the peer to join
					if(block.data.data.length === 1) {
						// Config block must only contain one transaction
						var channel_header = block.data.data[0].payload.header.channel_header;
						if (channel_header.channel_id === channel_name) {
							console.log('The new channel has been successfully joined on peer '+ eh.getPeerAddr());
							resolve();
						}
						else {
							console.log('The new channel has not been succesfully joined');
							reject();
						}
					}
				});
			});

			eventPromises.push(txPromise);
		});
		
		tx_id = client.newTransactionID();
		let request = {
			targets : targets,
			block : genesis_block,
			txId : 	tx_id
		};
		let sendPromise = channel.joinChannel(request);
		return Promise.all([sendPromise].concat(eventPromises));
		
	}, (err) => {
	
		console.log('Failed to enroll user \'admin\' due to error: ' + err);
		
	}).then((results) => {
	
		console.log('\nJoin Channel R E S P O N S E : ', results);

		if(results[0] && results[0][0] && results[0][0].response && results[0][0].response.status == 200) {
		
			console.log('Successfully joined peers in organization to join the channel');
			
		} else {
		
			console.log(' Failed to join channel');
		}
	}, (err) => {
	
		console.log('Failed to join channel due to error: ' + err);
		
	});
	
}

function getOrdererAdmin(client){

	var keyPath = '/fabric-test/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/keystore';
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = '/fabric-test/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/signcerts';
	var certPEM = readAllFiles(certPath)[0];
	
	return Promise.resolve(client.createUser({
		
		username: 'ordererAdmin',
		mspid: 'OrdererMSP',
		cryptoContent: {
			privateKeyPEM: keyPEM.toString(),
			signedCertPEM: certPEM.toString()
		}
	}));
}

function getSubmitter(client, peerOrgAdmin, org,pathOrg){

		var peerAdmin, userOrg;
		if (typeof peerOrgAdmin === 'boolean') {
			peerAdmin = peerOrgAdmin;
		} else {
			peerAdmin = false;
		}
		if (typeof peerOrgAdmin === 'string') {
			userOrg = peerOrgAdmin;
		} else {
		
			if (typeof org === 'string') {
				userOrg = org;
			} else {
				userOrg = 'org1';
			}
		}
		if (peerAdmin) {
			return getAdmin(client,userOrg,pathOrg);
		} else {
			return getMember('admin', 'adminpw', client, test, userOrg);
		}
}

function getAdmin(client, userOrg,pathOrg){

	var keyPath = '/home/fbadmin/FabricDevModeTest/fabric-samples/chaincode-docker-devmode/msp/keystore';
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = '/home/fbadmin/FabricDevModeTest/fabric-samples/chaincode-docker-devmode/msp/signcerts';
	var certPEM = readAllFiles(certPath)[0];
	var cryptoSuite = Client.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: "/hfc-test-kvs/"+pathOrg}));
		client.setCryptoSuite(cryptoSuite);
	}

	return Promise.resolve(client.createUser({
		username: 'peer'+userOrg+'Admin',
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
		let file_path = path.join(dir,file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}
Contact GitHub API Training Shop Blog About
© 2017 GitHub, Inc. Terms Privacy Security Status Help