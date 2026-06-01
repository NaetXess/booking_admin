import { apiUrl } from '$lib/config/config';
import moment from 'moment';
import Swal from 'sweetalert2';
import { goto } from '$app/navigation';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

function request(route, method, body = false, headers = false, isformdata = false, delay = false) {
	let url = apiUrl;
	return new Promise((resolve, reject) => {
		let options = {
			method,
			headers: {},
			credentials: 'include'
		};

		if (!isformdata) {
			Object.assign(options.headers, {
				'Content-Type': 'application/json'
			});
		}

		if (headers) {
			Object.assign(options.headers, headers);
		}

		if (body) {
			if (isformdata) {
				options.body = body;
			} else {
				options.body = JSON.stringify(body);
			}
		}
		if (delay) {
			//showLoader();
		}

		fetch(`${url}/${route}`, options)
			.then((response) => {
				if (response.status == 404) {
					throw new Error('Route Not Found !');
				} else if (response.status == 401) {
					localStorage.setItem('loggedIN', false);
					setTimeout(() => {
						if (delay) {
							// hideLoader();
						}

						goto('/login');
					}, 1000);
					throw new Error('Login Reqiure !');
				} else return response.json();
			})
			.then((response) => {
				if (response.code == 9) {
					alert('New version founded.');
					window.location.reload(true);
				} else if (response.code != 0) {
					let msg = '';
					if (typeof response.message === 'object') {
						response.message.forEach((element) => {
							msg = msg + element.message + ' ';
						});
					} else msg = response.message;
					throw new Error(msg);
				}

				setTimeout(() => {
					if (delay) {
						//hideLoader();
					}
					resolve(response);
				}, delay || 0);
			})
			.catch((error) => {
				if (delay) {
					//hideLoader();
				}
				toastCustom(error.message, 2);
				reject(error);
			});
	});
}

export const Get = (route, headers, delay) => request(route, 'GET', false, headers, false, delay);
export const Post = (route, body, headers, isformdata, delay) =>
	request(route, 'POST', body, headers, isformdata, delay);
export const Put = (route, body, headers, isformdata, delay) =>
	request(route, 'PUT', body, headers, isformdata, delay);
export const Delete = (route, headers) => request(route, 'DELETE', false, headers, false);

export function toastCustom(msg, type) {
	// show(msg, type);
	let icon = '';
	if (type === 1) {
		icon = 'success';
	} else if (type === 2) {
		icon = 'error';
	} else if (type === 3) {
		icon = 'info';
	}

	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		color: 'black',
		timer: 3000,
		timerProgressBar: true,
		didOpen: (toast) => {
			toast.onmouseenter = Swal.stopTimer;
			toast.onmouseleave = Swal.resumeTimer;
			toast.onclick = Swal.close;
		}
	});
	Toast.fire({
		icon: icon,
		title: msg
	});
}

export const fileToBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
	});

export function base64toBlob(base64Data, contentType) {
	contentType = contentType || '';
	var sliceSize = 1024;
	var byteCharacters = atob(base64Data);
	var bytesLength = byteCharacters.length;
	var slicesCount = Math.ceil(bytesLength / sliceSize);
	var byteArrays = new Array(slicesCount);

	for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
		var begin = sliceIndex * sliceSize;
		var end = Math.min(begin + sliceSize, bytesLength);

		var bytes = new Array(end - begin);
		for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
			bytes[i] = byteCharacters[offset].charCodeAt(0);
		}
		byteArrays[sliceIndex] = new Uint8Array(bytes);
	}
	return new Blob(byteArrays, { type: contentType });
}

export async function closeModal(id) {
	let bootstrap = await import('bootstrap');
	let rentModal = document.getElementById(id);
	let rentModalObj = bootstrap.Modal.getInstance(rentModal);
	rentModalObj.hide();
}
export async function openModal(id) {
	let bootstrap = await import('bootstrap');
	const myModal = new bootstrap.Modal(document.getElementById(id));
	myModal.show();
}

export async function closeDropdown(id) {
	let bootstrap = await import('bootstrap');
	const dropdownMenu = new bootstrap.Dropdown(document.getElementById(id));
	dropdownMenu.hide();
}

export async function swalModalDelete(title, text) {
	try {
		const result = await Swal.fire({
			title: title,
			text: text,
			icon: 'warning',
			showCancelButton: true,
			cancelButtonColor: '#d33',
			cancelButtonText: 'Vazgeç',
			confirmButtonColor: '#cb0c9f',
			confirmButtonText: 'Onayla!',
			reverseButtons: true
		});

		return result.isConfirmed;
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

export function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function deleteAllCookies() {
	const cookies = document.cookie.split(';');

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf('=');
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}
}

export function getCookie(cname) {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}
// { company_id: getCookie('company_id') } örnek
export function buildQuery(params) {
	let queries = [];
	for (const key in params) {
		if (params[key]) {
			queries.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
		}
	}
	return queries.length ? `?${queries.join('&')}` : '';
}

export function getUTCTime(date, time) {
	const localDate = new Date(`${date}T${time}`);

	return localDate.toISOString();
}

export function getTimeZone() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatDate(date, type = 9) {
	// let _arr = new Date(date).toLocaleString().toString().split('');

	// let _dateStr = `${_arr[6]}${_arr[7]}${_arr[8]}${_arr[9]}-${_arr[3]}${_arr[4]}-${_arr[0]}${_arr[1]}T${_arr[11]}${_arr[12]}:${_arr[14]}${_arr[15]}:00.000Z`;
	// date = _dateStr;

	// UTC kullanım örneği
	// let formattedDate = moment(date).format('DD MM');

	switch (type) {
		case 1: {
			let formattedDate = moment(date).format('DD MM');
			return getTrDate(formattedDate);
		}

		case 2:
			return moment(date).format('YYYY-MM-DD HH:mm');

		case 3:
			return moment(date).format('YYYY-MM-DD  HH:mm:ss.000');

		case 4:
			return moment(date).format('YYYY-MM-DD');

		case 5:
			return moment(date).format('HH:mm');

		case 6:
			return moment(date).format('DD.MM.YYYY HH:mm');

		case 7: {
			let formattedDate = moment(date).format('DD MM HH:mm');
			return getTrDate(formattedDate);
		}

		case 8: {
			let formattedDate = moment(date).format('DD MM');
			return getTrDate(formattedDate);
		}

		case 9: {
			let formattedDate = moment(date).format('DD MM YYYY');
			return getTrDate(formattedDate);
		}

		case 10: {
			let formattedDate = moment(date).format('DD MM YYYY HH:mm');

			return getTrDate(formattedDate);
		}

		default:
			return null;
	}
}

function getTrDate(date) {
	let _date = date.toString().split('');
	let _month = _date[3] + _date[4];
	let _string = '';

	switch (_month) {
		case '01':
			_string = 'Ocak';
			break;
		case '02':
			_string = 'Şubat';
			break;
		case '03':
			_string = 'Mart';
			break;
		case '04':
			_string = 'Nisan';
			break;
		case '05':
			_string = 'Mayıs';
			break;
		case '06':
			_string = 'Haziran';
			break;
		case '07':
			_string = 'Temmuz';
			break;
		case '08':
			_string = 'Ağustos';
			break;
		case '09':
			_string = 'Eylül';
			break;
		case '10':
			_string = 'Ekim';
			break;
		case '11':
			_string = 'Kasım';
			break;
		case '12':
			_string = 'Aralık';
			break;
	}
	if (_date.length == 10) {
		return _date[0] + _date[1] + ' ' + _string + ' ' + _date[6] + _date[7] + _date[8] + _date[9];
	} else if (_date.length == 16) {
		return (
			_date[0] +
			_date[1] +
			' ' +
			_string +
			' ' +
			_date[6] +
			_date[7] +
			_date[8] +
			_date[9] +
			_date[10] +
			' ' +
			_date[11] +
			_date[12] +
			':' +
			_date[14] +
			_date[15]
		);
	} else if (_date.length > 10) {
		return (
			_date[0] +
			_date[1] +
			' ' +
			_string +
			' ' +
			_date[6] +
			_date[7] +
			_date[8] +
			_date[9] +
			_date[10]
		);
	} else {
		return _date[0] + _date[1] + ' ' + _string;
	}
}

export function initials(name) {
	if (!name) return '?';
	const parts = name.trim().split(' ');
	return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

export function avatarColor(name) {
	const colors = [
		'#f5365c',
		'#f56036',
		'#ffd600',
		'#2dce89',
		'#11cdef',
		'#5e72e4',
		'#fb6340',
		'#f3a4b5'
	];
	let hash = 0;
	for (let i = 0; i < (name ?? '!').length; i++)
		hash = (name ?? '!').charCodeAt(i) + ((hash << 5) - hash);
	return colors[Math.abs(hash) % colors.length];
}

export function formatPhoneDisplay(countryCode, rawStr, format = 'national') {
	if (!rawStr || !countryCode) return '';
	const full = countryCode + rawStr;
	if (!isValidPhoneNumber(full)) return rawStr; // geçersizse orijinali döndür
	const phone = parsePhoneNumber(full);
	switch (format) {
		case 'national':
			return phone.formatNational(); // "0530 123 45 67"
		case 'international':
			return phone.formatInternational(); // "+90 530 123 45 67"
		case 'e164':
			return phone.format('E.164'); // "+905301234567"
		case 'uri':
			return phone.getURI(); // "tel:+90-530-123-45-67"
		case 'input':
			return phone.formatNational().replace(/^0/, '');
		default:
			return phone.formatNational();
	}
}

export function cropText(val, limit) {
	if (val) {
		let _array = val.toString().split('');
		let _text = '';
		if (_array.length) {
			for (let i = 0; i < _array.length; i++) {
				if (i <= limit) {
					_text += _array[i];
				}
			}
			if (limit < _array.length - 1) {
				_text += '. . .';
			}
		}
		return _text;
	} else {
		return '';
	}
}

export function debounce(func, delay) {
	let timeout;

	return async function (...args) {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}
