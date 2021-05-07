import axios from 'axios';

export const instance = axios.create({ });

export default (token) => {
    if (token) {
        instance.defaults.headers.common.authorization = `Bearer ${token}`;
    } else {
        delete instance.defaults.headers.common.authorization;
    }
}