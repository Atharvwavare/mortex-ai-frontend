import client from './client'

export const changePassword = (currentPassword: string, newPassword: string) =>
  client.post('/api/user/change-password', { currentPassword, newPassword })

export const deleteAccount = () => client.delete('/api/user/delete')