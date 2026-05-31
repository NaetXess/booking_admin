import { Delete, Get, Post, Put, toastCustom } from '@utils/function';

const route = 'api/finance';
const paymentTypeRoute = 'api/payment-types';

export class Finance {
	/** Şirketin tüm ödeme kayıtları */
	static getAll = async (delay) => {
		try {
			let response = await Get(`${route}/`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	/** Tek ödeme kaydı */
	static getById = async (id, delay) => {
		try {
			let response = await Get(`${route}/${id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	/** Rezervasyona ait tüm ödemeler (taksit listesi) */
	static getPaymentsByBookingId = async (booking_id, delay) => {
		try {
			let response = await Get(`${route}/bookings/${booking_id}/payments`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	/** Rezervasyonun ödeme özeti (paid/refund/pending/net) */
	static getSummaryByBookingId = async (booking_id, delay) => {
		try {
			let response = await Get(`${route}/bookings/${booking_id}/summary`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	/** Tekil ödeme oluştur */
	static createPayment = async (body, delay) => {
		try {
			let response = await Post(`${route}/`, body, true, false, delay);
			toastCustom('Ödeme başarıyla kaydedildi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	/** Taksit planı oluştur (backend N kayıt üretir) */
	static createInstallmentPlan = async (body, delay) => {
		try {
			let response = await Post(`${route}/installment-plan`, body, true, false, delay);
			toastCustom('Taksit planı başarıyla oluşturuldu', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	/** Ödeme güncelle (status, paid_at vb.) */
	static updatePayment = async (body, delay) => {
		try {
			let response = await Put(`${route}/`, body, true, false, delay);
			toastCustom('Ödeme başarıyla güncellendi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	/** Ödeme soft delete */
	static deletePayment = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Ödeme kaydı silindi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}

export class PaymentType {
	/** Tüm ödeme yöntemleri */
	static getAll = async (delay) => {
		try {
			let response = await Get(`${paymentTypeRoute}/`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
