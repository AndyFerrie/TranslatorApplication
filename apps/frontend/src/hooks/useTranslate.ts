"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { translateApi } from "@/lib"
import {
	TranslatePrimaryKey,
	TranslateRequest,
} from "@translatorapplication/shared-types"
import { useUser } from "./useUser"

export const useTranslate = () => {
	const { user } = useUser()
	const queryClient = useQueryClient()
	const queryKey = ["translate", user ? user.userId : ""]

	const translateQuery = useQuery({
		queryKey,
		queryFn: () => {
			if (!user) {
				return []
			}
			return translateApi.getUsersTranslations()
		},
	})

	const translateMutation = useMutation({
		mutationFn: (request: TranslateRequest) => {
			if (user) {
				return translateApi.translateUsersText(request)
			} else {
				return translateApi.translatePublicText(request)
			}
		},
		onSuccess: (result) => {
			if (translateQuery.data) {
				queryClient.setQueryData(
					queryKey,
					translateQuery.data.concat([result])
				)
			}
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (key: TranslatePrimaryKey) => {
			if (!user) {
				throw new Error("user not logged in")
			}

			return translateApi.deleteUserTranslation(key)
		},
		onSuccess: (result) => {
			if (!translateQuery.data) {
				return
			}

			const index = translateQuery.data.findIndex(
				(translateItem) => translateItem.requestId === result.requestId
			)
			const copyData = [...translateQuery.data]
			copyData.splice(index, 1)
			queryClient.setQueryData(queryKey, copyData)
		},
	})

	return {
		translations: !translateQuery.data ? [] : translateQuery.data,
		isLoading: translateQuery.status === "pending",
		translate: translateMutation.mutate,
		isTranslating: translateMutation.status === "pending",
		deleteTranslation: deleteMutation.mutate,
		isDeleting: deleteMutation.status === "pending",
	}
}
