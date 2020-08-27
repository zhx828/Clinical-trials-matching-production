export interface Tumors {
    [key:string]: Tumor;
}

export interface Tumor {
    nciCode: string;
    nciMainType: string;
    trials: Trial[];
    tumorName: string;
}

export interface Trial {
    briefTitle: string;
    currentTrialStatus: string;
    principalInvestigator?: string;
    nctId: string;
    arms: Arm[];
    isUSTrial?: boolean;
}

export type Arm = {
    armDescription: string;
    drugs: Drug[];
};

export interface Drug {
    drugName: string;
    ncitCode: string;
}

export interface TumorType {
    id?: string;
    name: string;
    tumorForm: string;
}
