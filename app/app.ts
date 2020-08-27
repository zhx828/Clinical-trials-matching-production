import express = require('express');
import bodyParser = require("body-parser");
import _ = require("lodash");
import cors = require('cors');
import AWS = require('aws-sdk');
import { Tumor, Tumors } from "./model";
import {
    getTrialByTumorTreatment, getTrialsByCancerType, getTrialsForSpecialCancerTye, getTumorCodesFromOncotree,
    isSpecialCancerType
} from "./util";
import { SpecialTumorTypeName } from "./constant";
import * as swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger/swagger.json";

const s3 = new AWS.S3({
    accessKeyId: process.env["ACCESS_KEY"],
    secretAccessKey: process.env["SECRET_KEY"]
});
const params = {
    Bucket: process.env["BUCKET_NAME"],
    Key: process.env["UPLOAD_PATH"]
};


// Create a new express application instance
const app: express.Application = express();

app.use(cors());//Enable All CORS Requests
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: false})); // to support URL-encoded bodies
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(2333, () => {
    console.log("Server running on port 2333");
});

app.get('/', (req: any, res: any) => {
    res.redirect('https://www.oncokb.org');
});

app.get('/trials/:tumorCode', (req: any, res: any) => {
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log("Read file failed:", err);
            res.send(`Cannot get data: ${err}.`);
        } else if (data.Body) {            
            const tumors: Tumors = JSON.parse(data.Body.toString('utf-8'));
            if (_.isUndefined(tumors[req.params.tumorCode])) {
                res.send(`Cannot find the tumor: ${req.params.tumorCode}`);
            } else {
                if (!("drugName" in req.query)){
                    res.send(tumors[req.params.tumorCode]);
                }
                else{
                    const result = getTrialByTumorTreatment(tumors[req.params.tumorCode].trials, req.query.drugName);
                    res.send(result);
                }
            }
        }
    });
});

app.post('/trials/cancerTypes', (req: any, res: any) => {
    s3.getObject(params, async (err, data) => {
        if (err) {
            console.log("Read file failed:", err);
            res.status(505).send('Load data failed.');
        } else if (data.Body) {
            const cancerTypes: string[] = req.body.cancerTypes;
            const tumors: Tumors = JSON.parse(data.Body.toString('utf-8'));
            let result: any = {};
            try {
                if (cancerTypes.includes(SpecialTumorTypeName.ALL_TUMORS)) {
                    result[SpecialTumorTypeName.ALL_TUMORS] = _.flatten(_.values(tumors).filter((tumor: Tumor) => tumor.trials.length > 0).map((tumor: Tumor) => tumor.trials));
                    result[SpecialTumorTypeName.ALL_TUMORS] = _.uniqBy(SpecialTumorTypeName.ALL_TUMORS, 'nctId');
                    res.status(200).send(result);
                    return;
                }
                await Promise.all(cancerTypes.map(async (cancerType) => {
                    if (isSpecialCancerType(cancerType)) {
                        result[cancerType] = _.flatten(await getTrialsForSpecialCancerTye(tumors, cancerType));
                    } else {
                        result[cancerType] = await getTrialsByCancerType(tumors, cancerType);
                    }
                    result[cancerType] = _.uniqBy(result[cancerType], 'nctId');
                }));

                if (_.isEmpty(result)) {
                    res.status(404).send('Cannot find trials');
                } else {
                    res.status(200).send(result);
                }
            } catch (exception) {
                console.log("Exception");
                res.status(505).send('Interal error occured in API.');
            }
        }
    });
});


