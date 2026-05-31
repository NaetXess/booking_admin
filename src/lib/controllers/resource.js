import { Delete, Get, Post, Put, buildQuery, toastCustom } from '@utils/function';

const route = 'api/resources';

export class Resource {
	static getAll = async (delay) => {
		try {
			// let queryString = buildQuery(params);
			// /${queryString}
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getResourceById = async (id, delay) => {
		try {
			let response = await Get(`${route}/${id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static createStaff = async (body, delay) => {
		try {
			let response = await Post(`${route}/staff`, body, true, false, delay);
			toastCustom('Personel başarıyla oluşturuldu', 1);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static updateStaff = async (body, delay) => {
		try {
			let response = await Put(`${route}/staff`, body, true, false, delay);
			toastCustom('Personel başarıyla güncellendi', 1);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static delete = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Kaynak başarıyla silindi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}
