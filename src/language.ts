export type Language = 'kk' | 'ru';

export function readLanguage(): Language {
  try {
    return localStorage.getItem('onlinemikro_language') === 'ru' ? 'ru' : 'kk';
  } catch {
    return 'kk';
  }
}
