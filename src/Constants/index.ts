import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

export const INSTAGRAM_USER = process.env.INSTAGRAM_USER as string;
export const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD as string;

export const BASE_URL = 'https://www.instagram.com';
export const LOGIN_PAGE = `${BASE_URL}/accounts/login/`;
export const USER_PAGE = `${BASE_URL}/higorhaalves/followers/`;
export const DEVICE = puppeteer.devices['iPhone 6'];

export const INPUT_USERNAME = 'input[name="username"]';
export const INPUT_PASSWORD = 'input[name="password"]';
export const SUBMIT_LOGIN_BUTTON = 'button[type="submit"]';
