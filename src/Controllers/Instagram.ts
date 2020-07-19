import fs from 'fs';
import path from 'path';
import Puppeteer, { ElementHandle } from 'puppeteer';

import { INSTAGRAM_PASSWORD, INSTAGRAM_USER, BASE_URL } from '@/Constants';
import Log from '@/Lib/Logger';
import scroll, { getWindowHeight } from '@/Lib/Scroll';

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

		try {
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
		} catch (error) {
			Log('WARN', 'Seems to be ok');
		} finally {
			Log('INFO', 'Successful logging');
		}
	}

	async isLoggedIn(): Promise<boolean> {
		const LOGIN_BUTTON_SELECTOR = '.dfm5c';

		try {
			await this.page.waitForSelector(LOGIN_BUTTON_SELECTOR, { timeout: 3000 });
			Log('WARN', 'No user logged in, you need to login to use the me!');
			return false;
		} catch (error) {
			return true;
		}
	}

	async getUserInfo(user: string): Promise<void> {
		Log('INFO', 'Going to user profile page');
		const NUMBER_OF_POSTS = '#react-root > section > main > div > ul > li:nth-child(1) > a > span';
		const NUMBER_OF_FOLLOWERS = '#react-root > section > main > div > ul > li:nth-child(2) > a > span';
		const NUMBER_OF_FOLLOWING = '#react-root > section > main > div > ul > li:nth-child(3) > a > span';

		await this.page.goto(`${BASE_URL}/${user}`);
		await this.page.waitForSelector(NUMBER_OF_POSTS);
		await this.page.waitForSelector(NUMBER_OF_POSTS);

		let numberOfPosts = (await this.page.$(NUMBER_OF_POSTS)) as ElementHandle;
		let numberOfFollowers = (await this.page.$(NUMBER_OF_FOLLOWERS)) as ElementHandle;
		let numberOfFollowing = (await this.page.$(NUMBER_OF_FOLLOWING)) as ElementHandle;

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

		await this.page.goto(`${BASE_URL}/${username}`);
		await this.page.waitForSelector(FOLLOWERS_SELECTOR);
		await this.page.tap(FOLLOWERS_SELECTOR);
	}

	async goToPost(postId: string): Promise<void> {
		Log('INFO', 'Going to post');
		const POST_LINK = `${BASE_URL}/p/${postId}/`;
		const POST_CONTAINER_SELECTOR = '#react-root > section > main > div > div > article';

		await this.page.goto(POST_LINK);
		await this.page.waitForSelector(POST_CONTAINER_SELECTOR);
	}

	async commentOnPost(postId: string, comment: string): Promise<void> {
		Log('INFO', 'Starting comment post');
		const COMMENT_POST_LINK = `${BASE_URL}/p/${postId}/comments/`;
		const COMMENT_BOX_SELECTOR = '#react-root > section > main > section > div > form > textarea';
		const SUBMIT_BUTTON_SELECTOR = 'button[type="submit"]';
		const ERROR_BOX_SELECTOR = '.HGN2m';
		const url = await this.page.url();

		if (url !== COMMENT_POST_LINK) {
			await this.page.goto(COMMENT_POST_LINK);
		}

		await this.page.waitForSelector(COMMENT_BOX_SELECTOR);
		await this.page.tap(COMMENT_BOX_SELECTOR);
		await this.page.type(COMMENT_BOX_SELECTOR, comment, { delay: 300 });
		await this.page.waitFor(Math.random() * 100 + Math.random() * 130);
		await this.page.tap(SUBMIT_BUTTON_SELECTOR);

		try {
			await this.page.waitForSelector(ERROR_BOX_SELECTOR, { timeout: 2000 });
			Log('WARN', 'We catch error on comment, this could be rate limit.');
			Log('WARN', 'To avoid problems i will wait 10 minutes');
			await this.page.waitFor(10 * 60000);
			await this.page.tap(SUBMIT_BUTTON_SELECTOR);
		} catch (error) {
			Log('INFO', 'Comment posted');
		}
	}

	async getFollowersList(username: string): Promise<any> {
		Log('INFO', `Getting follower data from ${username}`);
		const CONTAINER_LIST_SELECTOR = '#react-root > section > main > div > ul > div > li';
		const USERNAME_SELECTOR = 'li';

		let lastHeight = 0;
		let nowHeight = await getWindowHeight(this.page);
		let isDone = false;
		let listOfUsers: any[] = [];

		try {
			await this.page.waitForSelector(CONTAINER_LIST_SELECTOR, { timeout: 5000 });

			try {
				do {
					if (lastHeight === nowHeight) {
						isDone = true;
					} else {
						lastHeight = nowHeight;
						await scroll('li', this.page);
						await this.page.waitFor(3000);
						nowHeight = await getWindowHeight(this.page);
					}
				} while (!isDone);
			} catch (error) {
				Log('WARN', 'Something in the listing went wrong, possibly reached the rate limit.');
				Log('WARN', 'But I will still register the data that was possible to get.');
			}

			listOfUsers = await this.page.$$eval(USERNAME_SELECTOR, (elements) => {
				const data = [];

				for (const element of elements) {
					if (element.getElementsByClassName('_0imsa')[0] !== undefined) {
						const user = element.getElementsByClassName('_0imsa')[0].innerHTML;
						const name = element.getElementsByClassName('wFPL8')[0].innerHTML;
						const picture = element.getElementsByClassName('_6q-tv')[0].getAttribute('src') as string;
						let verified = false;

						if (element.getElementsByClassName('coreSpriteVerifiedBadge')[0] !== undefined) {
							verified = true;
						}

						data.push({ name, username: user, verified, picture });
					}
				}
				return data;
			});
			Log('INFO', `Total of users that I get: ${listOfUsers.length}`);
		} catch (error) {
			console.log(error);
			Log('ERROR', 'Seems Instagram is blocking me 😭.');
			Log('ERROR', 'But dont be afraid, just wait some time and try again');
			Log('ERROR', 'This is because of rate limit on instagram');
		}
		return listOfUsers;
	}

	async downloadPostImage(postId: string): Promise<void> {
		const POST_LINK = `${BASE_URL}/p/${postId}`;
		const IMAGE_SELECTOR = '#react-root > section > main > div > div.ltEKP > article > div._97aPb.wKWK0 > div > div > div.KL4Bh > img';
		const fileName = `${postId}.png`;
		const filePath = path.resolve(path.join('.', '/src', '/Database', '/Images'), fileName);

		await this.page.goto(POST_LINK, { waitUntil: 'networkidle0' });
		const link = (await this.page.$eval(IMAGE_SELECTOR, (img) => img.getAttribute('src'))) as string;

		const viewSource = (await this.page.goto(link)) as Puppeteer.Response;
		const writeStream = fs.createWriteStream(filePath);

		writeStream.write(await viewSource.buffer());
		writeStream.close();
	}
}

export default Instagram;
