import request from '@/utils/request'
import type { Wallpaper, Stats } from '@/types/homeTypes'

export const getWallpaper = () => {
    return request<Wallpaper>('/homeWallpaper')
}

export const getStats = () => {
    return request<Stats>('/stats')
}