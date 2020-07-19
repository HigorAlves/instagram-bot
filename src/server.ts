import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import { DEVICE, BASE_URL } from '@/Constants';
import FB from '@/Controllers/Facebook';
import Instagram from '@/Controllers/Instagram';
import { getCookies, setCookies } from '@/Lib/Cookies';
import Log from '@/Lib/Logger';

const CHROMIUM_OPTIONS_DEV = {
	slowMo: 60,
	headless: false,
	devtools: false,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	userDataDir: './user_data',
};

async function LoginIntoInsta() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS_DEV);
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();
	await getCookies(page);
	browser.close();
}

async function GetListOfUsers() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS_DEV);
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	const user = 'higorhaalves';
	const filePath = path.resolve(path.join('.', '/src', '/Database', '/Followers'), `${user}.json`);

	await page.emulate(DEVICE);
	await page.goto(BASE_URL);
	await insta.goToFollowersList(user);

	const lisOfUsers = await insta.getFollowersList(user);

	fs.writeFileSync(filePath, JSON.stringify(lisOfUsers));
}

async function CommentOnPost() {
	const user = 'higorhaalves';
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS_DEV);
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	const list = fs.readFileSync(`./src/Database/Followers/${user}.json`, 'utf8');
	const userList: [] = JSON.parse(list);
	const delayMinutes = 5 * 60000;
	let index = 60;

	await page.emulate(DEVICE);
	await setCookies(page);

	do {
		const comment = `@${userList[index].username}`;
		const delay = Math.floor(Math.random() * (9 - 1 + 1) + 1) * 100 + Math.random() * 100 + Math.random() * 99;
		index++;

		if (index % 10 === 0) {
			Log('INFO', 'We made 10 comments now we will wait some time to continue');
			await page.waitFor(delayMinutes);
		}

		await insta.commentOnPost('CCThaM8nqYm', comment);
		await page.waitFor(delay);
	} while (index < userList.length);

	Log('INFO', 'All comments have been posted');
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
	// await CommentOnPost();
	const fb = new FB();
	await fb.getAuthToken();
}

Log('INFO', 'Bot has been initialized');
init();
