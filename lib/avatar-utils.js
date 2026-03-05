export function getAvatarUrl(avatarPath) {
  if (!avatarPath) {
    return '/placeholder-user.jpg'
  }

  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  // Remove /api from the end of NEXT_PUBLIC_API_URL if present
  const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  
  // If avatarPath starts with 'storage/', we need to handle it differently
  if (avatarPath.startsWith('storage/')) {
    return `${baseUrl}/${avatarPath}`
  }
  
  // For paths that start with 'avatars/', prepend storage/
  if (avatarPath.startsWith('avatars/')) {
    return `${baseUrl}/storage/${avatarPath}`
  }
  
  // For any other path, assume it's relative to storage
  return `${baseUrl}/storage/${avatarPath}`
}
