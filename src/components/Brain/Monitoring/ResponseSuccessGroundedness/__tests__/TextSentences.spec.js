import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';

import TextSentences from '../TextSentences.vue';

describe('TextSentences.vue', () => {
  let wrapper;

  const fragmentsMock = [
    {
      sentence: 'This is slightly reliable.',
      sources: [{ filename: 'Test filename' }],
      score: 0,
      reliability: 'slightly-reliable',
    },
    {
      sentence: 'This is moderately reliable.',
      sources: [{ filename: 'Test filename' }],
      score: 0,
      reliability: 'moderately-reliable',
    },
    {
      sentence: 'This is highly reliable.',
      sources: [{ filename: 'Test filename' }],
      score: 0,
      reliability: 'highly-reliable',
    },
  ];

  const getReliabilityLevelMock = vi.fn((fragment) => fragment.reliability);

  const mountWrapper = (props = {}) => {
    wrapper = mount(TextSentences, {
      props: {
        fragments: fragmentsMock,
        getReliabilityLevel: getReliabilityLevelMock,
        ...props,
      },
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const sentences = () => wrapper.findAll('[data-testid="sentence-text"]');

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders a section with the correct class', () => {
    const sentencesContainer = wrapper.find('[data-testid="sentences"]');
    expect(sentencesContainer.exists()).toBe(true);
  });

  it('renders the correct number of sentences for each fragment', () => {
    expect(sentences().length).toBe(fragmentsMock.length);
  });

  it('renders each sentence correctly', () => {
    sentences().forEach((sentence, index) => {
      expect(sentence.text()).toContain(fragmentsMock[index].sentence);
    });
  });

  it('renders each sentence tooltip correctly', () => {
    sentences().forEach((sentence, index) => {
      expect(sentence.text()).toContain(
        wrapper.vm.getTooltipText(fragmentsMock[index]).replace('\n', ' '),
      );
    });
  });

  it('sets hoveredSentence on mouseover and clears it on mouseleave', async () => {
    await sentences()[0].trigger('mouseover');
    expect(wrapper.vm.hoveredSentence).toBe(0);

    await sentences()[1].trigger('mouseover');
    expect(wrapper.vm.hoveredSentence).toBe(1);

    await wrapper.find('[data-testid="sentences"]').trigger('mouseleave');
    expect(wrapper.vm.hoveredSentence).toBeNull();
  });

  it('applies the correct dynamic class for each fragment', () => {
    sentences().forEach((sentence, index) => {
      const reliabilityClass = `text-sentences__text--${fragmentsMock[index].reliability}`;
      expect(sentence.classes()).toContain(reliabilityClass);
    });
  });

  it('calls getReliabilityLevel for each fragment', () => {
    expect(getReliabilityLevelMock).toHaveBeenCalledTimes(fragmentsMock.length);
    fragmentsMock.forEach((fragment) => {
      expect(getReliabilityLevelMock).toHaveBeenCalledWith(fragment);
    });
  });

  it('renders no sentence when fragments are empty', async () => {
    await wrapper.setProps({ fragments: [] });
    expect(sentences().length).toBe(0);
  });

  it('renders different reliability levels correctly', () => {
    const reliabilityClasses = [
      'text-sentences__text--slightly-reliable',
      'text-sentences__text--moderately-reliable',
      'text-sentences__text--highly-reliable',
    ];
    sentences().forEach((sentence, index) => {
      expect(sentence.classes()).toContain(reliabilityClasses[index]);
    });
  });

  describe('truncateString', () => {
    const truncateString = (str, size) => wrapper.vm.truncateString(str, size);

    it('should return undefined for empty string', () => {
      expect(truncateString('')).toBeUndefined();
    });

    it('should return the original string if it is shorter than the maxLength', () => {
      expect(truncateString('Hello, world!')).toBe('Hello, world!');
    });

    it('should truncate the string if it is longer than the maxLength', () => {
      expect(truncateString('This is a very very very long string', 10)).toBe(
        'This is a ...',
      );
    });

    it('should use the default maxLength if not provided', () => {
      expect(truncateString('This is a very very very long string')).toBe(
        'This is a very very very ...',
      );
    });

    it('should handle strings with exact maxLength', () => {
      expect(truncateString('123456789012345', 15)).toBe('123456789012345');
    });
  });
});
