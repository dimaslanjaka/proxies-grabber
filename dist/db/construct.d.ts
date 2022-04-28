import 'js-prototypes';
declare class DBConstructor {
    folder: string;
    debug: boolean;
    constructor(folder: string);
    exists(key: string): boolean;
    push(key: string, value: any): void;
    private save;
    edit<T, K extends T>(key: string, newValue: T, by?: K): boolean;
    get<T>(key: string, fallback?: T): null | T | string | ReturnType<typeof JSON.parse> | ReturnType<typeof parseInt> | ReturnType<typeof parseFloat>;
    private locationfile;
}
export = DBConstructor;
