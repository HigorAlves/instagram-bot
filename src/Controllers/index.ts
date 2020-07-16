import Puppeteer from 'puppeteer';

import {
	DEVICE,
	LOGIN_PAGE,
	INPUT_PASSWORD,
	INPUT_USERNAME,
	SUBMIT_LOGIN_BUTTON,
	INSTAGRAM_PASSWORD,
	INSTAGRAM_USER,
	USER_PAGE,
} from '@/Constants';

class Instagram {
	private browser!: Puppeteer.Browser;

	private page!: Puppeteer.Page;

	constructor(browser: Puppeteer.Browser, page: Puppeteer.Page) {
		this.browser = browser;
		this.page = page;
	}

	async login(): Promise<void> {
		await this.page.emulate(DEVICE);
		await this.page.goto(LOGIN_PAGE);
		await this.page.waitForSelector(INPUT_USERNAME);
		await this.page.type(INPUT_USERNAME, INSTAGRAM_USER);
		await this.page.waitFor(1000);
		await this.page.type(INPUT_PASSWORD, INSTAGRAM_PASSWORD);
		await this.page.waitFor(2000);
		await this.page.click(SUBMIT_LOGIN_BUTTON);
		await this.page.waitForSelector('#react-root > section > main > div > div > div > button');
		await this.page.click('#react-root > section > main > div > div > div > button');
		await this.page.waitFor(2000);
	}

	async navigateToUserPage(): Promise<number> {
		try {
			await this.page.goto(USER_PAGE);
			await this.page.waitForSelector('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
			const followers = await this.page.$('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
			let countFollowers = 0;
			let text: string;

			if (followers) {
				text = (await (await followers.getProperty('textContent')).jsonValue()) as string;
				text = text.replace(',', '');
				countFollowers = parseInt(text, 10);
			}

			return countFollowers;
		} catch (error) {
			console.log(error);
			return 0;
		}
	}
}

export default Instagram;
