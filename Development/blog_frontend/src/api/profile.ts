import { request } from './client'
import { Profile } from '../types'

// Get a users profile by their id
export const getProfile = (id: number) => {
    return request<Profile>(`/users/${id}/profile/`)
}

// Update bio and profile picture(optinal)
export const updateProfile = (id: number, bio: string, profilePicture?: File) => {
    const formData = new FormData()
    formData.append('bio', bio)
    // Only apend profile_picture if a new file was selected
    if (profilePicture) {
        formData.append('profile_picture', profilePicture)
    }
    return request<Profile>(`/users/${id}/profile/`, {
        method: 'PATCH',
        body: formData,
    })
}