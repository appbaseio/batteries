import { ACC_API } from './index';

export const getPermission = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});

export const getAppInfo = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});

export const updatePermission = (appId, username, info) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permission/${username}`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(info),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const newPermission = (appId, info) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(info),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deletePermission = (appId, username) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permission/${username}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deleteApp = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const getShare = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/share`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});

export const getAppPlan = appName => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appName}/plan`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});
