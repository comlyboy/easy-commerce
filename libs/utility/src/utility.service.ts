import { Injectable } from '@nestjs/common';

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

import { EnvironmentConfig, ObjectType } from 'libs';


@Injectable()
export class UtilityService {

	/** Generates and return uuid. */
	GenerateUUID({ asUpperCase = false, symbol = '' }: {
		asUpperCase?: boolean;
		symbol?: string;
	} = {}): string {
		let uuid = uuidv4();
		if (symbol !== '') {
			if (symbol === ' ') symbol = '';
			uuid = uuid.replace(/-/gi, symbol);
		}
		if (asUpperCase) { uuid = uuid.toUpperCase(); }
		return uuid;
	}


	GenerateCustomUUID({ asUpperCase = false, symbol = '' }: {
		asUpperCase?: boolean;
		symbol?: string;
	} = {}): string {
		const keys = [this.GenerateDateInNumber(), '-', this.GenerateUUID({ asUpperCase, symbol })];
		return keys.join('');
	}


	/**
	Generates ID of either number, alphabets or mixture... Default is `Number`

	* 6 is default length

	Can generate add alphbet to id string by specifying param `useLetter` to `true`

	Can also choose the position of the alphabets in the string by specifying param `letterPosition` to either `start`  `center` or `end` , default is `start`
	*/
	GenerateCustomID(
		{ length = 6,
			useLetter = false,
			letterPosition = 'start' }: {
				length?: number;
				useLetter?: boolean;
				letterPosition?: 'start' | 'center' | 'end';
			} = {}): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			try {
				let lengtth = length - 2;
				const timestamp = +new Date();
				const alphabets = 'abcdefghjkmnpqrstuwxyz';
				const characters = '23456789';
				const charactersLength = characters.length;
				const ts = timestamp.toString();
				const parts = ts.split('').reverse();

				let id = '';
				let initial = '';
				let result = '';

				if (useLetter === true) {
					lengtth = lengtth - 2;
				}

				const getRandomInt = (min: number, max: number) => {
					return Math.floor(Math.random() * (max - min + 1)) + min;
				};

				for (let i = 0; i < lengtth; ++i) {
					const index = getRandomInt(0, parts.length - 1);
					id += parts[index];
				}

				for (let i = 0; i < 2; i++) {
					initial += characters.charAt(Math.floor(Math.random() * charactersLength));
				}

				if (useLetter === true) {
					let alpha = ``;

					for (let i = 0; i < 2; i++) {
						alpha += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
					}

					if (letterPosition === `end`) {
						result = `${initial}${id}${alpha}`;
						// } else if (letterPosition === `center`) {
						// result = `${initial}${id}`;
					} else {
						result = `${alpha}${initial}${id}`;
					}

				} else {
					result = `${initial}${id}`;
				}

				resolve(result);
			} catch (error) {
				reject(error)
			}
		});
	}


	// Date-time
	GenerateIsoReadableDateByTimeZone({ date, timeZone, isIso }: {
		date?: string | number | Date;
		timeZone: string;
		isIso?: boolean
	}) {
		isIso = isIso || false;
		const dateTime = this.rawDate(date).toLocaleString('en', { timeZone });
		if (isIso) {
			return this.GenerateISODate({ date: dateTime });
		}
		return this.GenerateReadableDate({ date: dateTime });
	}

	GenerateISODateFromCustomId({ customId }: { customId: string; }): string {
		const idTimeStampToArray = customId.split('-').slice(0, 2);
		const date = idTimeStampToArray.at(0);
		const time = idTimeStampToArray.at(1);
		const year = date.split('').slice(0, 4).join('');
		const month = date.split('').slice(4, 6).join('');
		const day = date.split('').slice(6).join('');
		const hour = time.split('').slice(0, 2).join('');
		const minute = time.split('').slice(2, 4).join('');
		const seconds = time.split('').slice(4, 6).join('');
		const milliseconds = time.split('').slice(6).join('') || '000';
		return `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${milliseconds}Z`;
	}

	GenerateDateTimeFromCustomUUID({ customId }: { customId: string; }): string {
		const idToArray = customId.split('-').slice(0, 2);
		return idToArray.join('');
	}

	// E.G 20220304-140507458
	GenerateDateInNumber({ date, withSeparation = false }: {
		date?: string | number | Date;
		withSeparation?: boolean;
	} = {}): string {
		const { year, month, day, hour, minute, seconds, milliseconds } = this.rawDateObject(date);
		if (!withSeparation) {
			return `${year}${month}${day}${hour}${minute}${seconds}${milliseconds}`;
		}
		return `${year}${month}${day}-${hour}${minute}${seconds}${milliseconds}`;
	}

	// Returns Year-Month-Day-Hour-Minute-Seconds-Milliseconds in ISO
	GenerateISODate({ date }: { date?: string | number | Date; } = {}): string {
		const { year, month, day, hour, minute, seconds, milliseconds } = this.rawDateObject(date);
		return `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${milliseconds}Z`;
	}

	GenerateReadableDate({ date }: { date?: string | number | Date; } = {}) {
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		let { year, month, day, weekDay, hour, minute, seconds } = this.rawDateObject(date);
		const monthIndex = +month.charAt(0) === 0 ? +month.charAt(1) : +month;
		month = months[monthIndex - 1];
		weekDay = days.at(+weekDay.slice(1));
		const time = `${hour}:${minute}:${seconds}`;
		return `${weekDay}, ${day} ${month}, ${year}. ${time}`;
	}

	GenerateNewDate({ date }: { date?: string | number | Date; } = {}) {
		return this.rawDate(date);
	}

	GenerateEpochTime(date?: string | number | Date) {
		return this.rawDate(date).getTime();
	}



	/** this function removes object object[propName] that is `undefined`, `null`, or `' '`. */
	SanitizeObject<TBody extends Record<string, any>>({
		data,
		keysToRemove = []
	}: {
		data: TBody;
		keysToRemove?: string[];
	}): Promise<TBody> {
		return new Promise<TBody>((resolve, reject) => {
			if (!(data && typeof data === "object")) { resolve(data); }
			if (Array.isArray(data)) { resolve(data); }
			keysToRemove.forEach(element => {
				if (data.hasOwnProperty(element)) { delete data[element as keyof TBody]; }
			});
			for (let property in data) {
				if (data[property] === null || data[property] === undefined || data[property] as any === 'undefined' || data[property] as any === '') { delete data[property]; }
			}
			resolve(data);
		});
	}


	SanitizeData<TBody extends ObjectType>() {

	}


	SortArray<TData>({ data, key, isReverse = false }: {
		data: TData[];
		key: string;
		isReverse?: boolean;
	}): TData[] {
		if (isReverse) {
			return data.sort((a: TData, b: TData) => (a[key as keyof TData] as any).localeCompare(b[key as keyof TData]))
		}
		return data.sort((a: TData, b: TData) => -(a[key as keyof TData] as any).localeCompare(b[key as keyof TData]))
	}


	ToTitleCase({ text }: {
		text: string;
	}): string {
		if (!text) return text;
		const result = text.split(".").map(item => {
			const firstCharacter = item.trim().charAt(0).toUpperCase();
			const otherCharacters = item.trim().slice(1, item.length);
			return `${firstCharacter}${otherCharacters}`;
		})
		return result.join('. ');
	}


	// Encryption
	async EncryptPaginationData<TBody extends Record<string, any>>(data: TBody) {
		return (!data || !Object.entries(data).length) ? null : await this.EncryptData({ ...data });
	}

	async DecryptPaginationData<TResponse>(data: string) {
		return data ? await this.DecryptData<TResponse>(data) : null;
	}

	EncryptData<TBody = any>(data: TBody): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			try {
				const dataToString = typeof data === 'string' ? data : JSON.stringify(data);
				const ciphertext = CryptoJS.AES.encrypt(dataToString, EnvironmentConfig.WORKINANCE_SERVER_SECRET_KEY).toString();
				resolve(ciphertext);
			} catch (error) {
				reject(error.message);
			}
		})
	}

	DecryptData<TResponse>(hashedData: string): Promise<TResponse> {
		return new Promise<TResponse>((resolve, reject) => {
			try {
				const bytes = CryptoJS.AES.decrypt(hashedData, EnvironmentConfig.WORKINANCE_SERVER_SECRET_KEY);
				const decryptedData = JSON.parse(bytes?.toString(CryptoJS.enc.Utf8)) as TResponse;
				resolve(decryptedData);
			} catch (error) {
				reject(error.message);
			}
		})
	}


	isIsoDate(date: string): boolean {
		return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[-+]\d{2}:\d{2})?)?$/.test(date);
	}


	// date time
	private rawDate(date?: string | number | Date): Date {
		return date ? new Date(date) : new Date();
	}

	private padStart({
		value,
		maxLength,
		fillingValue,
	}: {
		value: string | number;
		maxLength: number;
		fillingValue: string | number;
	}): string {
		return `${value}`.padStart(maxLength, `${fillingValue}`).trim();
	}


	private rawDateObject(date?: string | number | Date) {
		// https://stackoverflow.com/questions/63383340/angular-date-pipe-takes-into-account-timezone
		const now = this.rawDate(date);
		const isoDate = now.toISOString();
		const _date = isoDate.split('T').at(0);
		const time = isoDate.split('T').at(1);
		const year = _date.split('-').at(0);
		const month = _date.split('-').at(1);
		const day = _date.split('-').at(2);
		const weekDay = this.padStart({ value: now.getDay(), maxLength: 2, fillingValue: 0 });
		const hour = time.split(':').at(0);
		const minute = time.split(':').at(1);
		const seconds = time.split(':').at(2).slice(0, 2);
		const milliseconds = time.split('.').at(1).slice(0, 3);
		return { year, month, day, weekDay, hour, minute, seconds, milliseconds };
	}


}