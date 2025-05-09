import { sidebarCollapsed } from '@constants/constant';
import { windowWidth } from '@constants/constant';

export function handleResizeSidebar() {
	let className; //sidebar-open  sidebar-extended
	let wrapper = document.getElementById('wrapper');

	if (window.innerWidth < 1024) {
		className = 'sidebar-open';
	} else {
		className = 'sidebar-extended';
	}

	wrapper.classList.toggle(className);

	if (wrapper.classList.contains('sidebar-extended')) {
		sidebarCollapsed.set(false);
	} else {
		sidebarCollapsed.set(true);
	}
}

export function handleSidebarCollapse() {
	let sidebar = document.getElementById('sidebar-wrapper');
	let wrapper = document.getElementById('wrapper');

	wrapper.classList.add('sidebar-extended');

	if (!wrapper.classList.contains('sidebar-open')) {
		sidebar.style.left = '-250px';
		setTimeout(() => {
			sidebar.style.position = 'absolute';
			sidebar.style.width = '250px';
			sidebar.style.left = '0';
		}, 10);
	} else {
		sidebar.style.position = 'relative';
		sidebar.style.left = '-250px';
		setTimeout(() => {
			sidebar.style.removeProperty('width');
			sidebar.style.removeProperty('left');
		}, 170);
	}

	setTimeout(() => {
		wrapper.classList.toggle('sidebar-open');
	}, 170);

	if (!wrapper.classList.contains('sidebar-open')) {
		sidebarCollapsed.set(false);
	} else {
		sidebarCollapsed.set(true);
	}
}

export const handleFixSidebarSize = () => {
	let _width;
	windowWidth.set(window.innerWidth);
	windowWidth.subscribe((val) => {
		_width = val;
	});

	let wrapper = document.getElementById('wrapper');
	let sidebar = document.getElementById('sidebar-wrapper');

	if (_width < 1024) {
		// Ekran küçüldüğünde sidebar'ı genişletilmiş hale getir
		if (!wrapper.classList.contains('sidebar-extended')) {
			wrapper.classList.add('sidebar-extended');
		}
	} else {
		// Ekran genişlediğinde sidebar'ı sabit tut(animasyon için)

		if (
			wrapper.classList.contains('sidebar-open') &&
			wrapper.classList.contains('sidebar-extended')
		) {
			sidebar.style.position = 'absolute';
			sidebar.style.top = 0;
			sidebar.style.left = 0;
			sidebar.style.width = '250px';

			setTimeout(() => {
				sidebar.style.position = 'relative';
				sidebar.style.removeProperty('top');
				sidebar.style.removeProperty('left');
				sidebar.style.removeProperty('width');
			}, 170);
		} else {
			if (sidebar.style.position == 'absolute') {
				sidebar.style.position = 'relative';
			}
		}
	}
};
