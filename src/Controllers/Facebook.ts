import axios from '@/Services/Api';

export default class FacebookApi {
	private accessToken: string;

	private clientID: string;

	private clientSecret: string;

	constructor() {
		this.clientID = process.env.FACEBOOK_CLIENT_ID as string;
		this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET as string;
	}

	async getAuthToken(): Promise<string> {
		const token = await axios
			.get('oauth/access_token', {
				params: {
					client_id: this.clientID,
					client_secret: this.clientSecret,
					redirect_uri: 'https://www.example.com/authenticate/facebook/',
				},
			})
			.catch((error) => console.log(error));
		console.log(token);

		if (token.statusText === 'OK') {
			this.accessToken = token.data.access_token;
		}
		return this.accessToken;
	}
}
