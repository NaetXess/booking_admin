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
