import { Delete, Get, Post, Put, toastCustom } from '@utils/function';

const route = 'api/services';

export class Service {
	static getByCompanyId = async (delay) => {
		try {
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getByResourceId = async (resource_id, delay) => {
		try {
			let response = await Get(`${route}?resource_id=${resource_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getById = async (id, delay) => {
		try {
			let response = await Get(`${route}/${id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static create = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			toastCustom('Servis başarıyla oluşturuldu!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static update = async (body, delay) => {
		try {
			let response = await Put(`${route}`, body, true, false, delay);
			toastCustom('Servis başarıyla güncellendi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static delete = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Servis başarıyla silindi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}
