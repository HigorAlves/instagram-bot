import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import { INSTAGRAM_PASSWORD, INSTAGRAM_USER, BASE_URL, PHOTO_TO_COMMENT } from '@/Constants';
import Log from '@/Lib/Logger';

class Instagram {
	private browser!: Puppeteer.Browser;

	private page!: Puppeteer.Page;

	constructor(browser: Puppeteer.Browser, page: Puppeteer.Page) {
		this.browser = browser;
		this.page = page;
	}

	async login(): Promise<void> {
		const LOGIN_PAGE = `${BASE_URL}/accounts/login/`;
		const NOT_NOW_BUTTON = '#react-root > section > main > div > div > div > button';
		const INPUT_USERNAME = 'input[name="username"]';
		const INPUT_PASSWORD = 'input[name="password"]';
		const SUBMIT_BUTTON = 'button[type="submit"]';
		const ADD_INSTA_HOME = 'body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm';
		const NOTIFICATION_CANCEL_BUTTON = 'body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm';
		const DELAY = Math.random() * 100;

		Log('INFO', 'Logging in');

		await this.page.goto(LOGIN_PAGE);
		await this.page.waitForSelector(INPUT_USERNAME);
		await this.page.click(INPUT_USERNAME);
		await this.page.type(INPUT_USERNAME, INSTAGRAM_USER);
		await this.page.waitFor(DELAY);
		await this.page.click(INPUT_PASSWORD);
		await this.page.type(INPUT_PASSWORD, INSTAGRAM_PASSWORD);
		await this.page.waitFor(DELAY);
		await this.page.focus(SUBMIT_BUTTON);
		await this.page.click(SUBMIT_BUTTON);
		Log('INFO', 'Waiting for "Dont save" pop up');
		await this.page.waitForSelector(NOT_NOW_BUTTON);
		await this.page.click(NOT_NOW_BUTTON);
		Log('INFO', 'Waiting for "Add insta to Home" pop up');
		await this.page.waitForSelector(ADD_INSTA_HOME);
		await this.page.click(ADD_INSTA_HOME);

		await this.page.$eval('article:last-child', (e) => {
			e.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
		});
		Log('INFO', 'Waiting for "Notification" pop up');
		await this.page.waitForSelector(NOTIFICATION_CANCEL_BUTTON);
		await this.page.tap(NOTIFICATION_CANCEL_BUTTON);
		Log('INFO', 'Successful logging');
	}

	async navigateToUserPage(username: string): Promise<number> {
		try {
			await this.page.goto(`${BASE_URL}/${username}/followers`);
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
			throw new TypeError('[ERROR] some error message');
		}
	}

	async navigateToUserFollowers(): Promise<void> {
		await this.page.waitForSelector('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
		await this.page.click('#react-root > section > main > div > ul > li:nth-child(2) > a > span');
		await this.page.waitFor(2000);
	}

	async getUserFollowersList(): Promise<string[]> {
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

	async navigateToPost(): Promise<void> {
		const COMMENT_BUTTON = '#react-root > section > main > div > div > article > div.eo2As > section.ltpMr.Slqrh > span._15y0l > button';
		await this.page.goto(PHOTO_TO_COMMENT);
		await this.page.waitForSelector(COMMENT_BUTTON);
		await this.page.click(COMMENT_BUTTON);
		await this.page.waitFor(2000);
	}

	async commentOnPost(comment: string): Promise<void> {
		const COMMENT_BOX = 'textarea';
		const SUBMIT_BUTTON = 'button[type="submit"]';
		let hasError = false;
		const delay = Math.random() * 100 + Math.random() * 130;

		await this.page.waitFor(Math.floor(Math.random() * (3 - 1 + 1) + 1) * 54 + Math.random() * 78 + Math.random() * 99);
		await this.page.waitForSelector(COMMENT_BOX);

		await this.page.type(COMMENT_BOX, comment, { delay });
		await this.page.waitFor(Math.floor(Math.random() * (2 - 1 + 1) + 1) * 28 + Math.random() * 200 + Math.random() * 24);
		await this.page.click(SUBMIT_BUTTON);

		hasError = await this.page.evaluate(() => {
			const ERROR_BOX = 'gxNyb';
			const elements = document.getElementsByClassName(ERROR_BOX);
			if (elements.length > 0) {
				return true;
			}
			return false;
		});

		if (hasError) {
			console.info('[DEBUG] - Error on Comment - We"ll wait some random seconds');
			let errorCount = 0;
			do {
				if (errorCount > 2) {
					console.info('[DEBUG] - Too many erros on Comment - We"ll sleep for some time');
					await this.page.waitFor(21000 + Math.random() * 1000 + Math.random() + 201);
				}

				await this.page.waitFor(Math.floor(Math.random() * (2 - 1 + 1) + 1) * 28 + Math.random() * 200 + Math.random() * 3000);
				await this.page.click(SUBMIT_BUTTON);

				errorCount++;

				hasError = await this.page.evaluate(async () => {
					const ERROR_BOX = 'gxNyb';
					await this.page.type(COMMENT_BOX, comment, { delay });
					const elements = document.getElementsByClassName(ERROR_BOX);
					if (elements) {
						return true;
					}
					return false;
				});
			} while (hasError);
		}
	}

	async downloadPostImage(post: string): Promise<void> {
		const IMAGE_SELECTOR = '#react-root > section > main > div > div.ltEKP > article > div._97aPb.wKWK0 > div > div > div.KL4Bh > img';
		let link = '';
		const fileName = `${post.split('p/')[1].replace('/', '')}.png`;
		const filePath = path.resolve(path.join('.', '/src', '/Database', '/Images'), fileName);

		await this.page.goto(post, { waitUntil: 'networkidle0' });
		link = (await this.page.$eval(IMAGE_SELECTOR, (img) => img.getAttribute('src'))) as string;

		const viewSource = (await this.page.goto(link)) as Puppeteer.Response;
		const writeStream = fs.createWriteStream(filePath);

		writeStream.write(await viewSource.buffer());
		writeStream.close();
	}
}

export default Instagram;
