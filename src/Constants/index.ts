import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

export const DEVICE = puppeteer.devices['iPhone 6'];
export const CHROMIUM_OPTIONS = {
	slowMo: 60,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

export const INSTAGRAM_USER = process.env.INSTAGRAM_USER as string;
export const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD as string;

export const BASE_URL = 'https://www.instagram.com';
export const USER_PAGE = `${BASE_URL}/higorhaalves/followers/`;
export const PHOTO_TO_COMMENT = `${BASE_URL}/p/CCThaM8nqYm/`;
