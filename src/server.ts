import fs from 'fs';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers';

import { DEVICE } from './Constants';

async function LoginIntoInsta() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();

	browser.close();
}

async function GetListOfUsers() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);
	const insta = new Instagram(browser, page);
	await insta.navigateToUserPage();
	await insta.navigateToFollowers();
	const usersList = await insta.getFollowersList();
	// @ts-ignore
	fs.appendFileSync('./src/Database/userlist.txt', usersList);
	browser.close();
}

async function CommentOnPost() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.navigateToImage();

	const list = fs.readFileSync('./src/Database/userlist.txt', 'utf8');
	const userNames = list.split(',');
	let index = 33;

	do {
		const comment = `@${userNames[index]}`;
		const delay = Math.floor(Math.random() * (9 - 1 + 1) + 1) * 100 + Math.random() * 100 + Math.random() * 99;
		index++;
		console.log(`Tempo: ${delay} | Index: ${index} | Comment: ${comment}`);
		await page.waitFor(delay);
		await insta.commentOnPost(comment);
		await page.waitFor(9000 + Math.random() * 100);

		if (index % 20) {
			await page.waitFor(20000);
		}

		if (delay > 500 + Math.random() + 27) {
			await page.reload();
		}
	} while (index < userNames.length);
}

async function init() {
	await LoginIntoInsta();
	await CommentOnPost();
}

init();
