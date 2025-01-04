import {
	TranslateRequest,
	TranslatePrimaryKey,
	TranslateResultList,
	TranslateResult,
} from "@translatorapplication/shared-types"
import { fetchAuthSession } from "aws-amplify/auth"

const URL = "https://api.drewferrie.co.uk"

export const translatePublicText = async (request: TranslateRequest) => {
	try {
		const result = await fetch(`${URL}/public`, {
			method: "POST",
			body: JSON.stringify(request),
		})

		const returnValue = (await result.json()) as TranslateResult | string

		if (!result.ok) {
			throw new Error(returnValue as string)
		}
		return returnValue as TranslateResult
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}
export const translateUsersText = async (request: TranslateRequest) => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "POST",
			body: JSON.stringify(request),
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})

		const returnValue = (await result.json()) as TranslateResult | string

		if (!result.ok) {
			throw new Error(returnValue as string)
		}
		return returnValue as TranslateResult
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

export const getUsersTranslations = async () => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})

		const returnValue = (await result.json()) as TranslateResultList

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

export const deleteUserTranslation = async (item: TranslatePrimaryKey) => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "DELETE",
			body: JSON.stringify(item),
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})

		const returnValue = (await result.json()) as TranslatePrimaryKey

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}
