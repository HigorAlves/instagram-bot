import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers/Instagram';
import Log from '@/Lib/Logger';

import { DEVICE, BASE_URL, CHROMIUM_OPTIONS } from './Constants';

const CHROMIUM_OPTIONS_DEV = {
	slowMo: 60,
	headless: false,
	devtools: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	userDataDir: './user_data',
};

async function LoginIntoInsta() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS_DEV);
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();
	browser.close();
}

async function GetListOfUsers() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS);
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	const user = 'micaely_lamounier';
	const filePath = path.resolve(path.join('.', '/src', '/Database', '/Followers'), `${user}.json`);

	await page.emulate(DEVICE);
	await page.goto(BASE_URL);
	await insta.goToFollowersList(user);

	const lisOfUsers = await insta.getFollowersList(user);

	fs.writeFileSync(filePath, JSON.stringify(lisOfUsers));
}

async function CommentOnPost() {
	const user = 'micaely_lamounier';
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS_DEV);
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	const list = fs.readFileSync(`./src/Database/Followers/${user}.json`, 'utf8');
	const userList = JSON.parse(list);
	let index = 0;

	await page.emulate(DEVICE);

	do {
		const comment = `@${userList[index].username}`;
		const delay = Math.floor(Math.random() * (9 - 1 + 1) + 1) * 100 + Math.random() * 100 + Math.random() * 99;
		index++;
		Log('INFO', `Time: ${delay} | Index: ${index} | Comment: ${comment}`);

		await page.waitFor(delay);
		await insta.commentOnPost('CCThaM8nqYm', comment);
		await page.waitFor(4000 + Math.random() * 500);
	} while (index < 30);

	Log('INFO', 'I"ts done');
}
async function downloadPost() {
	const browser = await Puppeteer.launch();
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.downloadPostImage('CCn199BljJt');
}

async function init() {
	// await LoginIntoInsta();
	await CommentOnPost();
}

Log('INFO', 'Bot has been initialized');
init();
