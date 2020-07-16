import fs from 'fs';
import emoji from 'node-emoji';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers';

import { DEVICE } from './Constants';

async function Init() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();
	await insta.navigateToUserPage();
	await insta.navigateToFollowers();
	const usersList = await insta.getFollowersList();
	// @ts-ignore
	fs.appendFileSync('./src/Database/userlist.txt', usersList);

	// browser.close();
}

async function CommentOnPost() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.navigateToImage();

	const list = fs.readFileSync('./src/Database/userlist.txt', 'utf8');
	const userNames = list.split(',');
	for (const item of userNames) {
		const comment = `${item} ${emoji.random().emoji}`;
		await insta.commentOnPost(comment);
	}
}

CommentOnPost();
