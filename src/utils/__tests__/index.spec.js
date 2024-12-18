import { describe, it, expect } from 'vitest';
import {
  languageListToDict,
  LANGUAGES,
  WENIGPT_OPTIONS,
  createDownloadAnchor,
} from '@/utils';
import VERBOSE_LANGUAGES from '@/utils/verbose_languages';

describe('utils/index.js', () => {
  describe('languageListToDict', () => {
    it('should map languages to their verbose names', () => {
      const list = ['en', 'fr', 'es'];
      const expected = {
        en: VERBOSE_LANGUAGES.en || 'en',
        fr: VERBOSE_LANGUAGES.fr || 'fr',
        es: VERBOSE_LANGUAGES.es || 'es',
      };

      expect(languageListToDict(list)).toEqual(expected);
    });

    it('should use the language code if the verbose name is not defined', () => {
      const list = ['unknown'];
      const expected = {
        unknown: 'unknown',
      };

      expect(languageListToDict(list)).toEqual(expected);
    });
  });

  describe('LANGUAGES', () => {
    it('should correctly parse supported languages', () => {
      const expected = {
        en: 'English',
        fr: 'French',
        es: 'Spanish',
      };

      expect(LANGUAGES).toEqual(expected);
    });
  });

  describe('WENIGPT_OPTIONS', () => {
    it('should correctly parse the WENIGPT options', () => {
      const expected = [
        {
          name: 'golfinho-1',
          description: 'router.tunings.fields.golfinho-1',
          model: 'golfinho-1',
        },
        {
          name: 'shark-1',
          description: 'router.tunings.fields.shark-1',
          model: 'shark-1',
        },
      ];

      expect(WENIGPT_OPTIONS).toEqual(expected);
    });
  });

  describe('createDownloadAnchor', () => {
    it('should create an anchor element with the correct attributes', () => {
      const name = 'file.txt';
      const href = 'http://example.com/file.txt';

      const anchor = createDownloadAnchor({ name, href });

      expect(anchor.tagName).toBe('A');
      expect(anchor.getAttribute('download')).toBe(name);
      expect(anchor.getAttribute('href')).toBe(href);
    });
  });
});
