'use strict';
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(requestData) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        let result;
        if (requestData.key) {
            // returns a plain object — will be wrapped in API server
            result = await contract.evaluateTransaction('queryAsset', requestData.key);
        } else if (requestData.dept) {
            // returns [{ Key, Record }] already
            result = await contract.evaluateTransaction('queryByDepartment', requestData.dept);
        } else if (requestData.type) {
            // returns [{ Key, Record }] already
            result = await contract.evaluateTransaction('queryByDeviceType', requestData.type);
        } else {
            // returns [{ Key, Record }] already
            result = await contract.evaluateTransaction('queryAllAssets');
        }

        await gateway.disconnect();
        return result.toString();
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    }
}

module.exports.main = main;