import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import { INSTAGRAM_PASSWORD, INSTAGRAM_USER, BASE_URL, PHOTO_TO_COMMENT } from '@/Constants';
import Log from '@/Lib/Logger';
import scroll from '@/Lib/Scroll';

class Instagram {
	private browser!: Puppeteer.Browser;

	private page!: Puppeteer.Page;

	constructor(browser: Puppeteer.Browser, page: Puppeteer.Page) {
		this.browser = browser;
		this.page = page;
	}

	async login(): Promise<void> {
		Log('INFO', 'Logging in');
		const LOGIN_PAGE = `${BASE_URL}/accounts/login/`;
		const NOT_NOW_BUTTON = '#react-root > section > main > div > div > div > button';
		const INPUT_USERNAME = 'input[name="username"]';
		const INPUT_PASSWORD = 'input[name="password"]';
		const SUBMIT_BUTTON = 'button[type="submit"]';
		const ADD_INSTA_HOME = 'body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm';
		const NOTIFICATION_CANCEL_BUTTON = 'body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm';
		const DELAY = Math.random() * 100;

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

		await scroll('article', this.page);

		Log('INFO', 'Waiting for "Notification" pop up');
		await this.page.waitForSelector(NOTIFICATION_CANCEL_BUTTON);
		await this.page.tap(NOTIFICATION_CANCEL_BUTTON);
		Log('INFO', 'Successful logging');
	}

	async getMyInfo(): Promise<void> {
		Log('INFO', 'Going to user profile page');
		const PROFILE_BUTTON = '#react-root > section > nav.NXc7H.f11OC > div > div > div.KGiwt > div > div > div:nth-child(5) > a';
		const NUMBER_OF_POSTS = '#react-root > section > main > div > ul > li:nth-child(1) > span > span';
		const NUMBER_OF_FOLLOWERS = '#react-root > section > main > div > ul > li:nth-child(2) > a > span';
		const NUMBER_OF_FOLLOWING = '#react-root > section > main > div > ul > li:nth-child(3) > a > span';

		await this.page.waitForSelector(PROFILE_BUTTON);
		await this.page.click(PROFILE_BUTTON);
		await this.page.waitForSelector(NUMBER_OF_POSTS);
		let numberOfPosts = await this.page.$(NUMBER_OF_POSTS);
		let numberOfFollowers = await this.page.$(NUMBER_OF_FOLLOWERS);
		let numberOfFollowing = await this.page.$(NUMBER_OF_FOLLOWING);

		numberOfPosts = (await (await numberOfPosts.getProperty('textContent')).jsonValue()) as string;
		numberOfFollowers = (await (await numberOfFollowers.getProperty('textContent')).jsonValue()) as string;
		numberOfFollowing = (await (await numberOfFollowing.getProperty('textContent')).jsonValue()) as string;

		Log('INFO', `Data from your user`);
		console.table({ posts: numberOfPosts, followers: numberOfFollowers, following: numberOfFollowing });
		Log('INFO', 'Successful in get your data!');
	}

	async goToFollowersList(username: string): Promise<void> {
		Log('INFO', `Going to ${username} followers list`);
		const FOLLOWERS_SELECTOR = '#react-root > section > main > div > ul > li:nth-child(3)';
		const CONTAINER_LIST_SELECTOR = '#react-root > section > main > div > ul > div > li:nth-child(1)';

		await this.page.goto(`${BASE_URL}/${username}`);
		await this.page.waitForSelector(FOLLOWERS_SELECTOR);
		await this.page.tap(FOLLOWERS_SELECTOR);
		await this.page.waitForSelector(CONTAINER_LIST_SELECTOR);
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
