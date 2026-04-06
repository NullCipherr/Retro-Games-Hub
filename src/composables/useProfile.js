import { ref, watch } from 'vue';

const PROFILE_KEY = 'retro-games-hub:profile';
const SETTINGS_KEY = 'retro-games-hub:settings';

const DEFAULT_PROFILE = {
  name: 'Convidado',
  avatar: '👾'
};

const DEFAULT_SETTINGS = {
  animateBackground: true,
  enableSounds: false
};

function parseStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function useProfile() {
  const profile = ref(parseStorage(PROFILE_KEY, DEFAULT_PROFILE));
  const settings = ref(parseStorage(SETTINGS_KEY, DEFAULT_SETTINGS));

  watch(
    profile,
    (value) => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(value));
    },
    { deep: true }
  );

  watch(
    settings,
    (value) => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
    },
    { deep: true }
  );

  return {
    profile,
    settings
  };
}
