import { Get, Post, Put, Delete, toastCustom } from '@utils/function';

const route = 'api/customers';

export class Customer {
	static getAll = async (delay) => {
		try {
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static create = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			toastCustom('Müşteri başarıyla oluşturuldu', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static update = async (body, delay) => {
		try {
			let response = await Put(`${route}`, body, true, false, delay);
			toastCustom('Müşteri başarıyla güncellendi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static delete = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Müşteri başarıyla silindi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}
