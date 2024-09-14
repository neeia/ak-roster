import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const supabaseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
  tagTypes: ["operator", "account", "supports", "depot", "goals", "groups" ]
})

export type UID = { user_id: string };