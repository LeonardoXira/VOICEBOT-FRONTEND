/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'

const handleServerError = (error: AxiosError<any, any>) => {
  console.error(error.response)

  if (error.response?.status === 401 && error.response?.data === 'Unauthorized') {
    console.error('Unauthorized')
  } else if (error.response?.status === 500) {
    console.error('Internal Server Error')
  } else if (error.response?.status === 403) {
    console.error('Forbidden')
  }

  throw error
}

// Create an axios instance
export const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`
})

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error. Please check your internet connection')
    } else {
      handleServerError(error)
    }
  }
)

