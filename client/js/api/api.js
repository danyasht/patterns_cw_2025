'use strict';

export default class ApiService {
  static baseUrl = '/api';

  static async _request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  static async get(endpoint) {
    return this._request(endpoint, 'GET');
  }

  static async post(endpoint, body) {
    return this._request(endpoint, 'POST', body);
  }

  static async put(endpoint, body) {
    return this._request(endpoint, 'PUT', body);
  }

  static async delete(endpoint) {
    return this._request(endpoint, 'DELETE');
  }

  static async patch(endpoint, body) {
    return this._request(endpoint, 'PATCH', body);
  }
}
