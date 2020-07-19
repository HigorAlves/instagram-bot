import Axios from 'axios';

const axios = Axios.create({
	baseURL: 'https://graph.facebook.com/',
});

export default axios;
