import { Tumors, Trial, Drug, TumorType, Arm } from "./model";
import _ from "lodash";
import { SpecialTumorTypes, TumorForm } from "./constant";
import request = require("request");

export function isSpecialCancerType(cancerType: string) {
    return SpecialTumorTypes.includes(cancerType);
}
export async function getTrialsForSpecialCancerTye(tumors: Tumors, cancerType: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const reMappedCancerTypes: string[] = await getTumorNamesBySpecialTumorType( cancerType );
        let trials: any = [];
        Promise.all(reMappedCancerTypes.map(async (cancerType) => {
            trials.push(await getTrialsByCancerType(tumors, cancerType));
        })).then(()=>{
            return resolve(trials);
        });
    });
}

export async function getTrialsByCancerType(tumors: Tumors, cancerType: string) {
    let trials: Trial[] = [];
    const tumorCodesByMainType: string[] = await getTumorCodesFromOncotree( 'MainType', cancerType );
    if ( !_.isUndefined( tumorCodesByMainType ) && tumorCodesByMainType.length > 0 ) {
        _.forEach( tumorCodesByMainType, ( code: string ) => {
            if ( ! _.isUndefined( tumors[ code ] ) ) {
                trials = trials.concat( tumors[ code ].trials );
            }
        } );
    } else {
        const tumorCodesByName: string[] = await getTumorCodesFromOncotree( 'name', cancerType );
        if ( ! _.isUndefined( tumorCodesByName ) && tumorCodesByName.length > 0 ) {// cancerType is a subtype name.
            trials = trials.concat( tumors[ tumorCodesByName[ 0 ] ].trials );
        }
    }
    return trials;
}
export async function getTumorCodesFromOncotree(key: string, cancerType: string): Promise<string[]> {
    const oncotreeUrl = `http://oncotree.mskcc.org/api/tumorTypes/search/${key}/${cancerType}?exactMatch=true&levels=2,3,4,5`;
    let codes: string[] = [];
    return new Promise((resolve, reject) => {
        request( oncotreeUrl, { json: true }, ( error, response, body ) => {
            if ( !error && response.statusCode == 200 ) {
                _.forEach(body, (tumor) => codes.push(tumor.code));
            } else {
                console.log( error );
            }
            return resolve(codes);
        } );
    });
}
export function processTreatment(treatment: string) {
    let drugs : any = {};
    if (treatment.includes(',')) {
        const drugGroups: string[] = treatment.split(',');
        _.forEach(drugGroups, (drugGroup: string) => {
            if (drugGroup.includes('+')) {
                const drugCombination: string[] = drugGroup.split('+');
                drugs[drugGroup.trim()] = _.map(drugCombination, (drugName: string)=> drugName.trim());
            } else {
                drugs[drugGroup.trim()] = [drugGroup.trim()];
            }
        })
    } else if (treatment.includes('+')) {
        const drugCombination: string[] = treatment.split('+');
        drugs[treatment.trim()] = _.map(drugCombination, (drugName: string)=> drugName.trim());
    } else {
        drugs[treatment.trim()] = [treatment.trim()];
    }
    return drugs;
}
export function getTrialByTumorTreatment(trials: Trial[], treatment: string) {
    const drugGroups: any = processTreatment(treatment);
    const drugNames: string[] = _.flatten(_.values(drugGroups));
    return getTrialByTumorDrugName(trials, drugNames);
}

export function getTrialByTumorDrugName(trials: Trial[], drugNames: string[]){
    const matchedTrials: Trial[] = [];
    _.forEach(trials,(trial: Trial) => {
        _.some(trial.arms, (arm: Arm) => {
            let isMatched = false;
            const armDrugNames = arm.drugs.map((drug: Drug) => drug.drugName);
            if (_.difference(drugNames, armDrugNames).length === 0) {
                matchedTrials.push(trial);
                isMatched = true;
            }
            return isMatched;
        });
    });
    return matchedTrials;
}
export async function getTumorNamesBySpecialTumorType(cancerType: string): Promise<string[]> {
    const url = 'http://dashi.cbio.mskcc.org:38080/internal/api/private/utils/oncotree/mainTypes';
    const tumorTypes: string[] = [];
    return new Promise((resolve, reject) => {
        request( url, { json: true }, ( error, response, body ) => {
            if ( !error && response.statusCode == 200 ) {
                _.forEach(body, (tumor: TumorType) => {
                    if (tumor.tumorForm === TumorForm[cancerType]) {
                        tumorTypes.push(tumor.name.split(',')[0]);
                    }
                });
            } else {
                console.log( error );
            }
            return resolve(tumorTypes);
        } );
    });
}

