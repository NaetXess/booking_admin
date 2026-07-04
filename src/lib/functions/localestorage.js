export function getUserData() {
	let dataStr = localStorage.getItem('user');
	let data = JSON.parse(dataStr);
	return data;
}
