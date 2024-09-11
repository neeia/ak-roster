import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const supabaseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
  tagTypes: ["operator", "account", "supports" ]
})

export type UID = { user_id: string };