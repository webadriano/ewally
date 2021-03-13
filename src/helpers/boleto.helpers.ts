import ErrorHandler from '../errorHandlers';

const FIRST_DATE_BASE = "1997-10-07";
const SECOND_DATE_BASE = "2025-02-21";

export function calculateExpirationDate(factor: number): String {
    if (factor === 0) return "";

    let dateBase = FIRST_DATE_BASE;
    const today = new Date();

    if (today >= new Date(SECOND_DATE_BASE)) dateBase = SECOND_DATE_BASE;

    let date = new Date(dateBase);
    date.setDate(date.getDate() + factor);

    return date.toISOString().split('T')[0];
};


export function parseAmount(amount: string): String {
    amount = parseInt(amount).toString();

    if (amount === "0") return "";

    const decimalPlaces = amount.slice(amount.length - 2, amount.length);
    const intAmount = amount.slice(0, amount.length - 2);

    return [intAmount, ",", decimalPlaces].join('');
}

export function validateDV123(field: string): Boolean {
    const dv = parseInt(field.charAt(field.length -1));
    const digits = field.slice(0, -1).split("");
    let sum = 0;
    let multiplier = 1;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 1 ? 2 : 1;
        let total = b * multiplier;

        if (total > 9) {
            let totalString = total.toString().split("");

            while (total > 9) {
                total = totalString.map(Number).reduce((a, b): number => {
                    return a + b;
                });
            }
        }

        return a + total;
    }, 0);

    let foundDV = (Math.ceil(sum / 10) * 10) - sum;

    if (foundDV === 10) foundDV = 0;

    return dv === foundDV;
}

export function transformToBarcode(fields: Array<string>): String {
    let barcode = "";


    barcode += fields[0].substring(0, 3);
    barcode += fields[0].substring(3, 4);
    barcode += fields[3];
    barcode += fields[4].substring(0, 4);
    barcode += fields[4].substring(4, fields[4].length + 1);
    barcode = `${barcode}${fields[0].substr(4).slice(0, -1)}${fields[1].slice(0, -1)}${fields[2].slice(0, -1)}`;

    return barcode;
}

export function decodeTituloDigits(boletoNumber: string): Array<any> {
    const field1 = boletoNumber.substring(0, 10);
    const field2 = boletoNumber.substring(10, 21);
    const field3 = boletoNumber.substring(21, 32);
    const field4 = boletoNumber.substring(32, 33);
    const field5 = boletoNumber.substring(33, boletoNumber.length + 1);

    

    return [field1, field2, field3, field4, field5];
}

export function validateTituloDigits(boletoNumber: string): any {

    const fields = decodeTituloDigits(boletoNumber);
    const dv1 = validateDV123(fields[0]);
    const dv2 = validateDV123(fields[1]);
    const dv3 = validateDV123(fields[2]);

    if (!dv1 || !dv2 || !dv3) throw new ErrorHandler(400, "INVALID DV");

    const barCode = transformToBarcode(fields);

    const expirationDate = calculateExpirationDate(parseInt(fields[4].substring(0, 4)));

    const amount = parseAmount(fields[4].substring(4, fields[4].length + 1));

    return { barCode, amount, expirationDate }
}

export function decodeConvenioDigits(boletoNumber: string): Array<string> {
    const dac = boletoNumber.substring(3, 4);
    const field1 = boletoNumber.substring(0, 12);
    const field2 = boletoNumber.substring(12, 24);
    const field3 = boletoNumber.substring(24, 36);
    const field4 = boletoNumber.substring(36, boletoNumber.length + 1);

    
    return [ dac, field1, field2, field3, field4 ];
}

export function validateDAC10(field: string, dac: string): boolean {
    const digits = field.split("");

    let sum = 0;
    let multiplier = 1;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 1 ? 2 : 1;
        let total = b * multiplier;

        if (total > 9) {
            let totalString = total.toString().split("");
            
            total = totalString.map(Number).reduce((a, b): number => {
                return a + b;
            });
        }

        return a + total;
    }, 0);

    let foundDAC = 10 - (sum % 10);

    return parseInt(dac) === foundDAC;
}

export function validateDAC11(field: string, dac: string): boolean {
    const digits = field.split("");

    let sum = 0;
    let multiplier = 2;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 10 ? 2 : multiplier;
        let total = b * multiplier;

        multiplier++;

        return a + total;
    }, 0);

    let foundDAC = sum % 11;

    if (foundDAC === 1) foundDAC = 0;

    return parseInt(dac) === foundDAC;
}

export function validateConvenioDigits(boletoNumber: string): any {

    const [ dac, field1, field2, field3, field4 ] = decodeConvenioDigits(boletoNumber);
    const effectValue = parseInt(field1.substring(2, 3));

    let isDacGeneralValid;
    let isDacField1Valid;
    let isDacField2Valid;
    let isDacField3Valid;
    let isDacField4Valid;

    if (effectValue === 6 || effectValue === 7) {
        isDacGeneralValid = validateDAC10(`${field1.slice(0,3)+field1.slice(4).slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`, dac);
        isDacField1Valid = validateDAC10(`${field1.slice(0, -1)}`, field1.charAt(field1.length -1));
        isDacField2Valid = validateDAC10(`${field2.slice(0, -1)}`, field2.charAt(field2.length -1));
        isDacField3Valid = validateDAC10(`${field3.slice(0, -1)}`, field3.charAt(field3.length -1));
        isDacField4Valid = validateDAC10(`${field4.slice(0, -1)}`, field4.charAt(field4.length -1));
    } else if (effectValue === 8 || effectValue === 9) {
        isDacGeneralValid = validateDAC11(`${field1.slice(0,3)+field1.slice(4).slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`, dac);
        isDacField1Valid = validateDAC11(`${field1.slice(0, -1)}`, field1.charAt(field1.length -1));
        isDacField2Valid = validateDAC11(`${field2.slice(0, -1)}`, field2.charAt(field2.length -1));
        isDacField3Valid = validateDAC11(`${field3.slice(0, -1)}`, field3.charAt(field3.length -1));
        isDacField4Valid = validateDAC11(`${field4.slice(0, -1)}`, field4.charAt(field4.length -1));
    }

    if (!isDacGeneralValid || !isDacField1Valid || !isDacField2Valid || !isDacField3Valid || !isDacField4Valid) {
        throw new ErrorHandler(400, "INVALID DAC");
    }

    const barCode = `${field1.slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`;
    const amount = parseAmount(barCode.slice(4, 15));

    return { barCode, amount };
}