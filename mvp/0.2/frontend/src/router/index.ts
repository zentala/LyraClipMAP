import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: {
      title: 'Home - LyraClipMAP'
    }
  },
  {
    path: '/songs',
    name: 'SongList',
    component: () => import(/* webpackChunkName: "song-list" */ '@/views/SongList.vue'),
    meta: {
      title: 'My Songs - LyraClipMAP'
    }
  },
  {
    path: '/songs/:id',
    name: 'SongDetail',
    component: () => import(/* webpackChunkName: "song-detail" */ '@/views/SongDetail.vue'),
    meta: {
      title: 'Song Details - LyraClipMAP'
    }
  },
  {
    path: '/songs/add',
    name: 'AddSong',
    component: () => import(/* webpackChunkName: "add-song" */ '@/views/AddSong.vue'),
    meta: {
      title: 'Add Song - LyraClipMAP'
    }
  },
  {
    path: '/songs/:id/edit',
    name: 'EditSong',
    component: () => import(/* webpackChunkName: "edit-song" */ '@/views/EditSong.vue'),
    meta: {
      title: 'Edit Song - LyraClipMAP'
    }
  },
  {
    path: '/playlists',
    name: 'PlaylistList',
    component: () => import(/* webpackChunkName: "playlist-list" */ '@/views/PlaylistList.vue'),
    meta: {
      title: 'My Playlists - LyraClipMAP'
    }
  },
  {
    path: '/playlists/:id',
    name: 'PlaylistDetail',
    component: () => import(/* webpackChunkName: "playlist-detail" */ '@/views/PlaylistDetail.vue'),
    meta: {
      title: 'Playlist Details - LyraClipMAP'
    }
  },
  {
    path: '/artists',
    name: 'ArtistList',
    component: () => import(/* webpackChunkName: "artist-list" */ '@/views/ArtistList.vue'),
    meta: {
      title: 'Artists - LyraClipMAP'
    }
  },
  {
    path: '/artists/:id',
    name: 'ArtistDetail',
    component: () => import(/* webpackChunkName: "artist-detail" */ '@/views/ArtistDetail.vue'),
    meta: {
      title: 'Artist Details - LyraClipMAP'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue'),
    meta: {
      title: 'Search - LyraClipMAP'
    }
  },
  {
    path: '/lyrics-editor/:id',
    name: 'LyricsEditor',
    component: () => import(/* webpackChunkName: "lyrics-editor" */ '@/views/LyricsEditor.vue'),
    meta: {
      title: 'Lyrics Editor - LyraClipMAP'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue'),
    meta: {
      title: 'Settings - LyraClipMAP'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "not-found" */ '@/views/NotFound.vue'),
    meta: {
      title: 'Page Not Found - LyraClipMAP'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Update document title with route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'LyraClipMAP'
  next()
})

export default router