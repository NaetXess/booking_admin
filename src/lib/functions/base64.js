import { toastCustom } from '@utils/function';

export function decode(encodedData) {
	try {
		let base64ToString = atob(encodedData);
		base64ToString = JSON.parse(base64ToString);
		return base64ToString;
	} catch (error) {
		return false;
	}
}

export function encode(string) {
	try {
		let data = JSON.stringify(string);
		let stringToBase64 = btoa(data);
		return stringToBase64;
	} catch (error) {
		return false;
	}
}

export function splitQuery(query) {
	try {
		let _arr = query.split('|');
		let params = {
			comp_name: _arr[0],
			comp_queries: _arr[1]
		};
		return params;
	} catch (error) {
		toastCustom(error, 2);
		return false;
	}
}

export function getQueryParam(key, query) {
	try {
		let _obj = query.split(key + '=');
		return _obj[1];
	} catch (error) {
		toastCustom(error, 2);
		return false;
	}
}
