import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import GroundednessSources from '../GroundednessSources.vue';
import UnnnicIntelligenceText from '@/components/unnnic-intelligence/Text.vue';
import i18n from '@/utils/plugins/i18n';

describe('GroundednessSources.vue', () => {
  let wrapper;

  const fragmentsMock = [
    {
      sentence: 'First sentence.',
      sources: [{ filename: 'source1.pdf' }],
      score: 85,
      reliability: 'high',
    },
    {
      sentence: 'Second sentence.',
      sources: [{ filename: '' }],
      score: 70,
      reliability: 'moderate',
    },
    {
      sentence: 'Third sentence.',
      sources: [{ filename: 'source3.docx' }],
      score: 95,
      reliability: 'very-high',
    },
  ];

  const getReliabilityLevelMock = vi.fn((fragment) => fragment.reliability);

  const mountWrapper = (props = {}) => {
    wrapper = shallowMount(GroundednessSources, {
      props: {
        fragments: fragmentsMock,
        getReliabilityLevel: getReliabilityLevelMock,
        ...props,
      },
      global: {
        stubs: {
          UnnnicIntelligenceText,
        },
      },
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the correct number of sections for each fragment', () => {
    const sections = wrapper.findAll('[data-testid="source"]');
    expect(sections.length).toBe(fragmentsMock.length);
  });

  it('renders the reliability status class dynamically', () => {
    const sourcesStatus = wrapper.findAll('[data-testid="source-status"]');
    sourcesStatus.forEach((status, index) => {
      const reliabilityClass = `source__status--${fragmentsMock[index].reliability}`;
      expect(status.classes()).toContain(reliabilityClass);
    });
  });

  it('renders filename when available', () => {
    const filenames = wrapper.findAll('[data-testid="source-filename"]');
    expect(filenames.length).toBe(2);
    filenames.forEach((filename, index) => {
      expect(filename.text()).toBe(
        fragmentsMock[index === 1 ? 2 : 0].sources[0].filename,
      );
    });
  });

  it('renders "not found" text when filename is unavailable', () => {
    const notFoundTexts = wrapper.findAll(
      '[data-testid="source-filename-not-found"]',
    );
    expect(notFoundTexts.length).toBe(1);
    expect(notFoundTexts[0].text()).toBe(
      i18n.global.t('router.monitoring.inspect_response.not_found'),
    );
  });

  it('renders confidence percentage correctly', () => {
    const confidenceTexts = wrapper.findAll(
      '[data-testid="source-confidence"]',
    );
    confidenceTexts.forEach((confidence, index) => {
      expect(confidence.text()).toBe(
        i18n.global.t(
          'router.monitoring.inspect_response.confidence_percentage',
          {
            percentage: fragmentsMock[index].score,
          },
        ),
      );
    });
  });

  it('calls getReliabilityLevel for each fragment', () => {
    expect(getReliabilityLevelMock).toHaveBeenCalledTimes(fragmentsMock.length);
    fragmentsMock.forEach((fragment) => {
      expect(getReliabilityLevelMock).toHaveBeenCalledWith(fragment);
    });
  });

  it('renders no sections when fragments are empty', async () => {
    await wrapper.setProps({ fragments: [] });
    const sections = wrapper.findAll('data-testid="source"');
    expect(sections.length).toBe(0);
  });
});
