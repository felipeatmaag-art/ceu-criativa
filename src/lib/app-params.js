const isNode = typeof window === 'undefined';

const safeStorage = {
	getItem: (key) => {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				return window.localStorage.getItem(key);
			}
		} catch (_e) {}
		return null;
	},
	setItem: (key, val) => {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				window.localStorage.setItem(key, val);
			}
		} catch (_e) {}
	},
	removeItem: (key) => {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				window.localStorage.removeItem(key);
			}
		} catch (_e) {}
	}
};

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	let searchParam = null;
	try {
		const urlParams = new URLSearchParams(window.location.search);
		searchParam = urlParams.get(paramName);
		if (removeFromUrl && searchParam) {
			urlParams.delete(paramName);
			const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
			if (window?.history?.replaceState) {
				window.history.replaceState({}, document.title || '', newUrl);
			}
		}
	} catch (_e) {
		// Ignore iframe search/history restrictions
	}

	if (searchParam) {
		safeStorage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue !== undefined) {
		safeStorage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = safeStorage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
};

const getAppParams = () => {
	try {
		if (getAppParamValue("clear_access_token") === 'true') {
			safeStorage.removeItem('base44_access_token');
			safeStorage.removeItem('token');
		}
	} catch (_e) {}

	return {
		appId: getAppParamValue("app_id", { defaultValue: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BASE44_APP_ID) || "69431e0c00397efc6e14e9df" }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: typeof window !== 'undefined' ? window.location.href : '' }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BASE44_FUNCTIONS_VERSION : undefined }),
	};
};

export const appParams = {
	...getAppParams()
};
