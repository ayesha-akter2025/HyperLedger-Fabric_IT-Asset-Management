'use strict';
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(assetData) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('appUser');
        if (!identity) return;

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        // createAsset(id, device_type, brand, purchase_year, department, assigned_to)
        await contract.submitTransaction('createAsset',
            assetData.key,
            assetData.device_type,
            assetData.brand,
            assetData.purchase_year,
            assetData.department,
            assetData.owner
        );

        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to create: ${error}`);
        throw error;
    }
}

module.exports.main = main;