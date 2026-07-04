export function hasPermission(item) {
	let userRole = 0;

	const userJson = localStorage.getItem('user');
	if (userJson) {
		userRole = JSON.parse(userJson).type;
	}

	if (!item.roles) return true;
	return item.roles.includes(userRole);
}
