export class StandardResponse{
    code: number;
    message: string;
    data?: any;


    constructor(code: number, message: string, data?: any){
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
