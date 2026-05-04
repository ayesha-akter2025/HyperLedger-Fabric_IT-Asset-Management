'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const query = require('./query');
const createCar = require('./createCar');
const changeOwner = require('./changeOwner');

const app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET /get-asset
// ?key=ASSET001        → queryAsset       → single object, wrapped here into [{ Key, Record }]
// ?dept=CSE            → queryByDepartment → already [{ Key, Record }]
// ?type=Laptop         → queryByDeviceType → already [{ Key, Record }]
// (no params)          → queryAllAssets    → already [{ Key, Record }]
app.get('/get-asset', function (req, res) {
    query.main(req.query)
        .then(result => {
            const parsedData = JSON.parse(result);

            // queryAsset returns a plain object — wrap it so the frontend render() always gets [{ Key, Record }]
            if (req.query.key && !Array.isArray(parsedData)) {
                res.send([{ Key: req.query.key, Record: parsedData }]);
            } else {
                res.send(parsedData);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('FAILED TO GET DATA!');
        });
});

// POST /create
// Body fields: key, device_type, brand, purchase_year, department, owner
app.post('/create', function (req, res) {
    createCar.main(req.body)
        .then(() => {
            res.send({ message: 'Asset Registered successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('FAILED TO CREATE ASSET!');
        });
});

// POST /update
// Body fields: key, owner, department
app.post('/update', function (req, res) {
    changeOwner.main(req.body)
        .then(() => {
            res.send({ message: 'Asset Owner Transferred successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('FAILED TO UPDATE OWNER!');
        });
});

app.listen(3000, () => console.log('Asset Management API running at port 3000'));