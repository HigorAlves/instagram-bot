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

	async navigateToFollowers(): Promise<void> {
		await this.page.waitForSelector('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
		await this.page.click('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
		await this.page.waitFor(2000);
	}

	async getFollowersList(): Promise<string[]> {
		await this.page.waitFor(4000);
		let list: string[] = [];
		let isDone = true;

		async function getWindowHeight(page: Puppeteer.Page): Promise<number> {
			const height = await page.evaluate(() => {
				return document.body.scrollHeight;
			});
			return height;
		}

		let lastHeight = 0;
		let nowHeight = await getWindowHeight(this.page);

		do {
			if (lastHeight === nowHeight) {
				isDone = false;
			} else {
				lastHeight = nowHeight;
				list = await this.page.evaluate(() => {
					const data = [];
					const elements = document.getElementsByClassName('FPmhX notranslate  _0imsa ');
					for (const element of elements) data.push(element.textContent);
					// @ts-ignore
					document.scrollingElement.scrollBy(0, document.body.scrollHeight);
					return data as string[];
				});
				await this.page.waitFor(4000);
				nowHeight = await getWindowHeight(this.page);
			}

			await this.page.waitFor(2000);
		} while (isDone);

		console.log('[DEBUG] - Total of users get: ', list.length);

		return list;
	}
}

export default Instagram;
