import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import { DEVICE } from '@/Constants';
import Instagram from '@/Controllers/Instagram';
import { saveCookies, loadCookies } from '@/Lib/Cookies';
import Log from '@/Lib/Logger';

export default class Bot {
	private page: Puppeteer.Page;

	private browser: Puppeteer.Browser;

	private insta: Instagram;

	constructor(page: Puppeteer.Page, browser: Puppeteer.Browser) {
		this.page = page;
		this.browser = browser;
		this.insta = new Instagram(this.browser, this.page);
	}

	async init(): Promise<void> {
		await this.page.emulate(DEVICE);
	}

	async loginMyAccount(): Promise<void> {
		Log('INFO', 'Checking if there is a user logged in');
		await loadCookies(this.page);
		const isLogged = await this.insta.isLoggedIn();

		if (!isLogged) {
			Log('INFO', 'No users logged in, logging in with your account');
			await this.insta.login();
			Log('INFO', 'Saving cookies');
			await saveCookies(this.page);
		} else {
			Log('INFO', 'Session successfully restored');
		}
	}

	async commentOnPost(listOfComment: string, postId: string): Promise<void> {
		const loadFile = fs.readFileSync(`./src/Database/Followers/${listOfComment}.json`, 'utf8');
		const userList: [{ username: string }] = JSON.parse(loadFile);
		let index = 0;

		do {
			index++;

			const delayMinutes = Math.random() * (5 - 1) + 1 * 60000;
			const delay = Math.floor(Math.random() * (9 - 1 + 1) + 1) * 100 + Math.random() * 100 + Math.random() * 99;
			const comment = `@${userList[index].username}`;

			if (index % 10 === 0) {
				Log('INFO', 'We made 10 comments now we will wait some time to continue');
				await this.page.waitFor(delayMinutes);
			}

			await this.insta.commentOnPost(postId, comment);
			await this.page.waitFor(delay);
		} while (index < userList.length);

		Log('INFO', 'All comments have been posted');
	}

	async GetListOfUsers(username: string): Promise<void> {
		const filePath = path.resolve(path.join('.', '/src', '/Database', '/Followers'), `${username}.json`);
		const list = await this.insta.getFollowersList(username);
		fs.writeFileSync(filePath, JSON.stringify(list));
	}

	async savePostImage(postId: string): Promise<void> {
		const fileName = `${postId}.png`;
		const filePath = path.resolve(path.join('.', '/src', '/Database', '/Images'), fileName);
		const writeStream = fs.createWriteStream(filePath);
		const image = await this.insta.downloadPostImage(postId);

		writeStream.write(await image.buffer());
		writeStream.close();
	}
}
