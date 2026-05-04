'use strict';

const { Contract } = require('fabric-contract-api');

class ITAssetManagement extends Contract {

    async initLedger(ctx) {
        const assets = [
            {
                id: 'ASSET001',
                device_type: 'Laptop',
                brand: 'Dell',
                purchase_year: '2023',
                department: 'CSE',
                assigned_to: 'Dr. Smith',
            },
            {
                id: 'ASSET002',
                device_type: 'Projector',
                brand: 'Epson',
                purchase_year: '2022',
                department: 'EEE',
                assigned_to: 'John Doe',
            },
        ];

        for (let i = 0; i < assets.length; i++) {
            await ctx.stub.putState(assets[i].id, Buffer.from(JSON.stringify(assets[i])));
        }
    }

    async createAsset(ctx, id, device_type, brand, purchase_year, department, assigned_to) {
        const asset = {
            id,
            device_type,
            brand,
            purchase_year,
            department,
            assigned_to,
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    async queryAsset(ctx, id) {
        const assetAsBytes = await ctx.stub.getState(id);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        return assetAsBytes.toString();
    }

    async queryAllAssets(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

    async changeAssetOwner(ctx, id, newOwner, newDept) {
        const assetAsBytes = await ctx.stub.getState(id);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        const asset = JSON.parse(assetAsBytes.toString());
        asset.assigned_to = newOwner;
        asset.department = newDept;

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // Advanced Search/Filter Logic
    async queryByDepartment(ctx, department) {
        let queryString = { selector: { department: department } };
        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        return await this._GetAllResults(resultsIterator);
    }

    async queryByDeviceType(ctx, deviceType) {
        let queryString = { selector: { device_type: deviceType } };
        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        return await this._GetAllResults(resultsIterator);
    }

    async _GetAllResults(iterator) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = ITAssetManagement;