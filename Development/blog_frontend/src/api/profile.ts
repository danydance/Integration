import { request } from './client'
import { Profile } from '../types'

export const getProfile = (id: number) => {
    return request<Profile>(`/users/${id}/profile/`)
}

export const updateProfile = (id: number, bio: string, profilePicture?: File) => {
    const formData = new FormData()
    formData.append('bio', bio)
    if (profilePicture) {
        formData.append('profile_picture', profilePicture)
    }
    return request<Profile>(`/users/${id}/profile/`, {
        method: 'PATCH',
        body: formData,
    })
}