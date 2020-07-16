import Puppeteer from 'puppeteer';

import { DEVICE, LOGIN_PAGE, INPUT_PASSWORD, INPUT_USERNAME, SUBMIT_LOGIN_BUTTON, INSTAGRAM_PASSWORD, INSTAGRAM_USER } from '@/Constants';

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
		await this.page.waitFor(2000);
	}
}

export default Instagram;
