export enum SpecialTumorTypeName {
    ALL_TUMORS = 'All Tumors',
    ALL_LIQUID_TUMORS = 'All Liquid Tumors',
    ALL_SOLID_TUMORS = 'All Solid Tumors'
}

export const SpecialTumorTypes: string[] = ['All Tumors','All Liquid Tumors','All Solid Tumors'];

export const TumorForm: { [key: string]: string } = {
    [SpecialTumorTypeName.ALL_LIQUID_TUMORS]: 'LIQUID',
    [SpecialTumorTypeName.ALL_SOLID_TUMORS]: 'SOLID'
};
